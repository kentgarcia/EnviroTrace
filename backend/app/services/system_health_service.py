import psutil
import platform
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.auth_models import User, ActivityLog, UserSession, FailedLogin


class SystemHealthService:
    """Service for collecting real system health metrics and statistics"""
    
    @staticmethod
    def get_system_metrics() -> List[Dict[str, Any]]:
        """Get real-time system health metrics using psutil"""
        try:
            # CPU usage percentage
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # Memory usage
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            
            # Disk usage for the main drive
            disk = psutil.disk_usage('/')
            disk_percent = (disk.used / disk.total) * 100
            
            # Network I/O (simplified metric)
            network = psutil.net_io_counters()
            # Convert to a percentage based on typical usage patterns (this is a simplified approach)
            # In production, you might want to track this over time for more meaningful metrics
            network_activity = min(((network.bytes_sent + network.bytes_recv) / (1024 * 1024 * 1024)) * 10, 100)
            
            # Determine status based on usage
            def get_status(value: float) -> str:
                if value < 60:
                    return "good"
                elif value < 80:
                    return "warning"
                else:
                    return "critical"
            
            return [
                {
                    "metric": "CPU Usage",
                    "value": round(cpu_percent, 1),
                    "status": get_status(cpu_percent)
                },
                {
                    "metric": "Memory Usage", 
                    "value": round(memory_percent, 1),
                    "status": get_status(memory_percent)
                },
                {
                    "metric": "Disk Space",
                    "value": round(disk_percent, 1),
                    "status": get_status(disk_percent)
                },
                {
                    "metric": "Network I/O",
                    "value": round(network_activity, 1),
                    "status": get_status(network_activity)
                }
            ]
        except Exception as e:
            # Fallback to basic metrics if psutil fails
            return [
                {"metric": "CPU Usage", "value": 0, "status": "warning"},
                {"metric": "Memory Usage", "value": 0, "status": "warning"},
                {"metric": "Disk Space", "value": 0, "status": "warning"},
                {"metric": "Network I/O", "value": 0, "status": "warning"}
            ]
    
    @staticmethod
    def get_system_uptime() -> str:
        """Get system uptime in human-readable format"""
        try:
            boot_time = psutil.boot_time()
            uptime_seconds = time.time() - boot_time
            uptime_delta = timedelta(seconds=int(uptime_seconds))
            
            days = uptime_delta.days
            hours, remainder = divmod(uptime_delta.seconds, 3600)
            minutes = remainder // 60
            
            return f"{days}d {hours}h {minutes}m"
        except Exception:
            return "Unknown"
    
    @staticmethod
    async def get_user_statistics(db: AsyncSession) -> Dict[str, Any]:
        """Get real user statistics from database"""
        try:
            # Total users count
            total_users_result = await db.execute(
                select(func.count(User.id)).where(User.deleted_at.is_(None))
            )
            total_users = total_users_result.scalar() or 0
            
            # Active users (signed in within last 30 days)
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            active_users_result = await db.execute(
                select(func.count(User.id)).where(
                    and_(
                        User.deleted_at.is_(None),
                        User.last_sign_in_at >= thirty_days_ago
                    )
                )
            )
            active_users = active_users_result.scalar() or 0
            
            # Active sessions count
            current_time = datetime.utcnow()
            active_sessions_result = await db.execute(
                select(func.count(UserSession.id)).where(
                    and_(
                        UserSession.ended_at.is_(None),
                        UserSession.expires_at > current_time
                    )
                )
            )
            active_sessions = active_sessions_result.scalar() or 0
            
            # Failed logins in last 24 hours
            twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
            failed_logins_result = await db.execute(
                select(func.count(FailedLogin.id)).where(
                    FailedLogin.created_at >= twenty_four_hours_ago
                )
            )
            failed_logins = failed_logins_result.scalar() or 0
            
            return {
                "total_users": total_users,
                "active_users": active_users,
                "active_sessions": active_sessions,
                "failed_logins": failed_logins
            }
        except Exception as e:
            return {
                "total_users": 0,
                "active_users": 0,
                "active_sessions": 0,
                "failed_logins": 0
            }
    
    @staticmethod
    async def get_user_activity_data(db: AsyncSession) -> List[Dict[str, Any]]:
        """Get real user activity data for charts"""
        try:
            # Get data for last 6 months
            current_date = datetime.utcnow()
            six_months_ago = current_date - timedelta(days=180)
            
            # Get monthly user registrations
            registrations_query = await db.execute(
                select(
                    func.extract('year', User.created_at).label('year'),
                    func.extract('month', User.created_at).label('month'),
                    func.count(User.id).label('registrations')
                ).where(
                    and_(
                        User.created_at >= six_months_ago,
                        User.deleted_at.is_(None)
                    )
                ).group_by(
                    func.extract('year', User.created_at),
                    func.extract('month', User.created_at)
                ).order_by(
                    func.extract('year', User.created_at),
                    func.extract('month', User.created_at)
                )
            )
            
            registrations_data = registrations_query.fetchall()
            
            # Get monthly login activity (from activity logs)
            logins_query = await db.execute(
                select(
                    func.extract('year', ActivityLog.created_at).label('year'),
                    func.extract('month', ActivityLog.created_at).label('month'),
                    func.count(ActivityLog.id).label('logins')
                ).where(
                    and_(
                        ActivityLog.created_at >= six_months_ago,
                        ActivityLog.activity_type == 'login'
                    )
                ).group_by(
                    func.extract('year', ActivityLog.created_at),
                    func.extract('month', ActivityLog.created_at)
                ).order_by(
                    func.extract('year', ActivityLog.created_at),
                    func.extract('month', ActivityLog.created_at)
                )
            )
            
            logins_data = logins_query.fetchall()
            
            # Create monthly data structure
            months = []
            for i in range(6):
                month_date = current_date - timedelta(days=30 * i)
                month_name = month_date.strftime('%b')
                months.insert(0, {
                    'date': month_name,
                    'year': month_date.year,
                    'month': month_date.month,
                    'logins': 0,
                    'registrations': 0,
                    'activeUsers': 0
                })
            
            # Fill in registration data
            for reg in registrations_data:
                for month in months:
                    if month['year'] == reg.year and month['month'] == reg.month:
                        month['registrations'] = reg.registrations
                        break
            
            # Fill in login data
            for login in logins_data:
                for month in months:
                    if month['year'] == login.year and month['month'] == login.month:
                        month['logins'] = login.logins
                        break
            
            # Calculate active users for each month (simplified - users who logged in that month)
            for month in months:
                month_start = datetime(month['year'], month['month'], 1)
                if month['month'] == 12:
                    month_end = datetime(month['year'] + 1, 1, 1)
                else:
                    month_end = datetime(month['year'], month['month'] + 1, 1)
                
                active_users_query = await db.execute(
                    select(func.count(func.distinct(ActivityLog.user_id))).where(
                        and_(
                            ActivityLog.created_at >= month_start,
                            ActivityLog.created_at < month_end,
                            ActivityLog.activity_type == 'login'
                        )
                    )
                )
                month['activeUsers'] = active_users_query.scalar() or 0
            
            return [
                {
                    'date': month['date'],
                    'logins': month['logins'],
                    'registrations': month['registrations'],
                    'activeUsers': month['activeUsers']
                }
                for month in months
            ]
            
        except Exception as e:
            # Fallback data if there's an error
            return [
                {"date": "Jan", "logins": 0, "registrations": 0, "activeUsers": 0},
                {"date": "Feb", "logins": 0, "registrations": 0, "activeUsers": 0},
                {"date": "Mar", "logins": 0, "registrations": 0, "activeUsers": 0},
                {"date": "Apr", "logins": 0, "registrations": 0, "activeUsers": 0},
                {"date": "May", "logins": 0, "registrations": 0, "activeUsers": 0},
                {"date": "Jun", "logins": 0, "registrations": 0, "activeUsers": 0},
            ]
