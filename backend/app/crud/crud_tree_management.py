from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from datetime import date, datetime
from app.crud.base_crud import CRUDBase
from app.models.urban_greening_models import TreeManagementRequest, TreeRequest, TreeRequestProcessingStandards, TreeRequestDropdownOption
from app.schemas.tree_management_schemas import (
    TreeManagementRequestCreate, 
    TreeManagementRequestUpdate,
    TreeRequestCreate,
    TreeRequestUpdate,
    UpdateReceivingPhase,
    UpdateInspectionPhase,
    UpdateRequirementsPhase,
    UpdateClearancePhase,
    UpdateDENRPhase,
    ProcessingStandardsCreate,
    ProcessingStandardsUpdate,
    TreeRequestWithAnalytics,
    DropdownOptionCreate,
    DropdownOptionUpdate
)


class CRUDTreeManagementRequest(CRUDBase[TreeManagementRequest, TreeManagementRequestCreate, TreeManagementRequestUpdate]):
    def get_by_request_number(self, db: Session, *, request_number: str) -> Optional[TreeManagementRequest]:
        return db.query(TreeManagementRequest).filter(TreeManagementRequest.request_number == request_number).first()

    def get_by_request_type(self, db: Session, *, request_type: str) -> List[TreeManagementRequest]:
        return db.query(TreeManagementRequest).filter(TreeManagementRequest.request_type == request_type).all()

    def get_by_status(self, db: Session, *, status: str) -> List[TreeManagementRequest]:
        return db.query(TreeManagementRequest).filter(TreeManagementRequest.status == status).all()

    def get_by_requester(self, db: Session, *, requester_name: str) -> List[TreeManagementRequest]:
        return db.query(TreeManagementRequest).filter(TreeManagementRequest.requester_name.ilike(f"%{requester_name}%")).all()

    def get_pending_requests(self, db: Session) -> List[TreeManagementRequest]:
        return db.query(TreeManagementRequest).filter(
            TreeManagementRequest.status.in_(["filed", "on_hold", "for_signature", "payment_pending"])
        ).all()

    def get_by_date_range(self, db: Session, *, start_date: date, end_date: date) -> List[TreeManagementRequest]:
        return db.query(TreeManagementRequest).filter(
            and_(
                TreeManagementRequest.request_date >= start_date,
                TreeManagementRequest.request_date <= end_date
            )
        ).all()

    def get_sync(self, db: Session, id: str) -> Optional[TreeManagementRequest]:
        """Synchronous version of get for use with sync sessions"""
        return db.query(TreeManagementRequest).filter(TreeManagementRequest.id == id).first()

    def get_multi_sync(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[TreeManagementRequest]:
        """Synchronous version of get_multi for use with sync sessions"""
        return db.query(TreeManagementRequest).offset(skip).limit(limit).all()

    def create_sync(self, db: Session, *, obj_in: TreeManagementRequestCreate) -> TreeManagementRequest:
        """Synchronous version of create for use with sync sessions"""
        import json
        from datetime import date as dt_date
        
        obj_in_data = obj_in.model_dump()
        
        # Auto-generate request number if not provided
        if not obj_in_data.get('request_number'):
            # Generate request number: TR{YEAR}-{sequential}
            from datetime import datetime
            today = datetime.now()
            year = today.year
            # Count this year's requests
            count = db.query(TreeManagementRequest).filter(
                TreeManagementRequest.request_number.like(f"TR{year}-%")
            ).count()
            obj_in_data['request_number'] = f"TR{year}-{count + 1:04d}"
        
        # Auto-set request_date to today if not provided
        if not obj_in_data.get('request_date'):
            obj_in_data['request_date'] = dt_date.today()
        
        # Convert list fields to JSON strings for database storage
        obj_in_data['linked_tree_ids'] = json.dumps(obj_in_data.get('linked_tree_ids', []) or [])
        obj_in_data['new_trees'] = json.dumps(obj_in_data.get('new_trees', []) or [])
        obj_in_data['inspectors'] = json.dumps(obj_in_data.get('inspectors', []) or [])
        obj_in_data['picture_links'] = json.dumps(obj_in_data.get('picture_links', []) or [])
            
        db_obj = TreeManagementRequest(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_sync(self, db: Session, *, db_obj: TreeManagementRequest, obj_in: TreeManagementRequestUpdate) -> TreeManagementRequest:
        """Synchronous version of update for use with sync sessions"""
        import json
        
        update_data = obj_in.model_dump(exclude_unset=True)
        
        # Convert list fields to JSON strings for database storage
        if 'linked_tree_ids' in update_data:
            update_data['linked_tree_ids'] = json.dumps(update_data['linked_tree_ids'] or [])
        if 'new_trees' in update_data:
            update_data['new_trees'] = json.dumps(update_data['new_trees'] or [])
        if 'inspectors' in update_data:
            update_data['inspectors'] = json.dumps(update_data['inspectors'] or [])
        if 'picture_links' in update_data:
            update_data['picture_links'] = json.dumps(update_data['picture_links'] or [])
            
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove_sync(self, db: Session, *, id: str) -> Optional[TreeManagementRequest]:
        """Synchronous version of remove for use with sync sessions"""
        obj = db.query(TreeManagementRequest).filter(TreeManagementRequest.id == id).first()
        if obj:
            db.delete(obj)
            db.commit()
        return obj

    def get_by_monitoring_request(self, db: Session, *, monitoring_request_id: str) -> List[TreeManagementRequest]:
        """Get tree management requests linked to a specific monitoring request"""
        return db.query(TreeManagementRequest).filter(
            TreeManagementRequest.monitoring_request_id == monitoring_request_id
        ).all()


tree_management_request = CRUDTreeManagementRequest(TreeManagementRequest)


# ===== NEW ISO TREE REQUEST CRUD =====

class CRUDTreeRequest(CRUDBase[TreeRequest, TreeRequestCreate, TreeRequestUpdate]):
    """CRUD operations for new ISO tree request tracking"""
    
    def create_sync(self, db: Session, *, obj_in: TreeRequestCreate, current_user_id: Optional[str] = None) -> TreeRequest:
        """Create new tree request with auto-generated request number"""
        import json
        from app.models.auth_models import User
        
        obj_in_data = obj_in.model_dump()
        
        # Set created_by only if user exists
        if current_user_id:
            user_exists = db.query(User).filter(User.id == current_user_id).first()
            if user_exists:
                obj_in_data['created_by'] = current_user_id
        
        # Auto-generate request number if not provided
        if not obj_in_data.get('request_number'):
            today = datetime.now()
            year = today.year
            # Count this year's requests
            count = db.query(TreeRequest).filter(
                TreeRequest.request_number.like(f"{year}-%")
            ).count()
            obj_in_data['request_number'] = f"{year}-{count + 1:04d}"
        
        # Convert requirements_checklist to JSON string
        if obj_in_data.get('requirements_checklist'):
            obj_in_data['requirements_checklist'] = json.dumps([
                item.model_dump() if hasattr(item, 'model_dump') else item 
                for item in obj_in_data['requirements_checklist']
            ])
        
        db_obj = TreeRequest(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update_sync(self, db: Session, *, db_obj: TreeRequest, obj_in: TreeRequestUpdate, current_user_id: Optional[str] = None) -> TreeRequest:
        """Update tree request and track editors"""
        import json
        from app.models.auth_models import User
        
        update_data = obj_in.model_dump(exclude_unset=True)
        
        # Convert requirements_checklist to JSON string
        if 'requirements_checklist' in update_data and update_data['requirements_checklist'] is not None:
            update_data['requirements_checklist'] = json.dumps([
                item.model_dump() if hasattr(item, 'model_dump') else item 
                for item in update_data['requirements_checklist']
            ])
        
        # Track editors only if user exists
        if current_user_id:
            user_exists = db.query(User).filter(User.id == current_user_id).first()
            if user_exists:
                existing_editors = []
                if db_obj.editors:
                    existing_editors = db_obj.editors if isinstance(db_obj.editors, list) else []
                
                if current_user_id not in existing_editors:
                    existing_editors.append(current_user_id)
                    update_data['editors'] = existing_editors
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update_receiving_phase(self, db: Session, *, request_id: str, phase_data: UpdateReceivingPhase) -> Optional[TreeRequest]:
        """Update receiving phase of a request"""
        obj = db.query(TreeRequest).filter(TreeRequest.id == request_id).first()
        if not obj:
            return None
        
        update_data = phase_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(obj, field, value)
        
        # Auto-advance status if receiving is complete
        if obj.receiving_date_received and obj.receiving_date_received_by_dept_head:
            if obj.overall_status == 'receiving':
                obj.overall_status = 'inspection'
        
        db.commit()
        db.refresh(obj)
        return obj
    
    def update_inspection_phase(self, db: Session, *, request_id: str, phase_data: UpdateInspectionPhase) -> Optional[TreeRequest]:
        """Update inspection phase of a request"""
        obj = db.query(TreeRequest).filter(TreeRequest.id == request_id).first()
        if not obj:
            return None
        
        update_data = phase_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(obj, field, value)
        
        # Auto-advance status if inspection is complete
        if obj.inspection_date_of_inspection and obj.inspection_date_submitted_to_dept_head:
            if obj.overall_status == 'inspection':
                obj.overall_status = 'requirements'
        
        db.commit()
        db.refresh(obj)
        return obj
    
    def update_requirements_phase(self, db: Session, *, request_id: str, phase_data: UpdateRequirementsPhase) -> Optional[TreeRequest]:
        """Update requirements phase of a request"""
        import json
        
        obj = db.query(TreeRequest).filter(TreeRequest.id == request_id).first()
        if not obj:
            return None
        
        update_data = phase_data.model_dump(exclude_unset=True)
        
        # Convert requirements_checklist to JSON
        if 'requirements_checklist' in update_data and update_data['requirements_checklist'] is not None:
            update_data['requirements_checklist'] = json.dumps([
                item.model_dump() if hasattr(item, 'model_dump') else item 
                for item in update_data['requirements_checklist']
            ])
        
        for field, value in update_data.items():
            setattr(obj, field, value)
        
        # Auto-advance status if requirements are complete
        if obj.requirements_date_completion:
            if obj.overall_status == 'requirements':
                obj.overall_status = 'clearance'
        
        db.commit()
        db.refresh(obj)
        return obj
    
    def update_clearance_phase(self, db: Session, *, request_id: str, phase_data: UpdateClearancePhase) -> Optional[TreeRequest]:
        """Update clearance phase of a request"""
        obj = db.query(TreeRequest).filter(TreeRequest.id == request_id).first()
        if not obj:
            return None
        
        update_data = phase_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(obj, field, value)
        
        # Auto-advance status if clearance is complete
        if obj.clearance_date_issued:
            if obj.overall_status == 'clearance':
                obj.overall_status = 'completed'
        
        db.commit()
        db.refresh(obj)
        return obj
    
    def update_denr_phase(self, db: Session, *, request_id: str, phase_data: UpdateDENRPhase) -> Optional[TreeRequest]:
        """Update DENR phase of a request"""
        obj = db.query(TreeRequest).filter(TreeRequest.id == request_id).first()
        if not obj:
            return None
        
        update_data = phase_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(obj, field, value)
        
        # Auto-advance status if DENR is complete
        # Logic: If received back from DENR, maybe completed? 
        # Or if status is specifically set to 'completed' via explicit update, handled elsewhere.
        # Minimal auto-logic here for now.
        
        db.commit()
        db.refresh(obj)
        return obj
    
    def get_by_request_number(self, db: Session, *, request_number: str) -> Optional[TreeRequest]:
        """Get request by request number"""
        return db.query(TreeRequest).filter(TreeRequest.request_number == request_number).first()
    
    def get_by_status(self, db: Session, *, status: str, skip: int = 0, limit: int = 100) -> List[TreeRequest]:
        """Get requests by overall status"""
        return db.query(TreeRequest).filter(
            TreeRequest.overall_status == status
        ).offset(skip).limit(limit).all()
    
    def get_by_request_type(self, db: Session, *, request_type: str, skip: int = 0, limit: int = 100) -> List[TreeRequest]:
        """Get requests by type"""
        return db.query(TreeRequest).filter(
            TreeRequest.request_type == request_type
        ).offset(skip).limit(limit).all()
    
    def get_with_analytics(self, db: Session, request_id: str) -> Optional[Dict[str, Any]]:
        """Get request with delay analytics computed"""
        from datetime import date as dt_date
        import json
        
        obj = db.query(TreeRequest).filter(TreeRequest.id == request_id).first()
        if not obj:
            return None
        
        # Get processing standards
        standards = db.query(TreeRequestProcessingStandards).filter(
            TreeRequestProcessingStandards.request_type == obj.request_type
        ).first()
        
        # Calculate days in each phase
        today = dt_date.today()
        
        days_in_receiving = 0
        if obj.receiving_date_received:
            end_date = obj.inspection_date_received_by_inspectors or (today if obj.overall_status == 'receiving' else obj.receiving_date_received)
            days_in_receiving = (end_date - obj.receiving_date_received).days
        
        days_in_inspection = 0
        if obj.inspection_date_received_by_inspectors:
            # Inspection ends when requirements phase starts (or now if still in inspection)
            end_date = obj.inspection_date_submitted_to_dept_head or (today if obj.overall_status == 'inspection' else obj.inspection_date_received_by_inspectors)
            days_in_inspection = (end_date - obj.inspection_date_received_by_inspectors).days
        
        days_in_requirements = 0
        if obj.inspection_date_submitted_to_dept_head:
            # Requirements starts when inspection is submitted to dept head
            end_date = obj.requirements_date_completion or (today if obj.overall_status == 'requirements' else obj.inspection_date_submitted_to_dept_head)
            days_in_requirements = (end_date - obj.inspection_date_submitted_to_dept_head).days
        
        days_in_clearance = 0
        if obj.requirements_date_completion:
            end_date = obj.clearance_date_issued or (today if obj.overall_status == 'clearance' else obj.requirements_date_completion)
            days_in_clearance = (end_date - obj.requirements_date_completion).days
        
        total_days = days_in_receiving + days_in_inspection + days_in_requirements + days_in_clearance
        
        # Check if delayed
        is_delayed = False
        if standards:
            if obj.overall_status == 'receiving' and days_in_receiving > standards.receiving_standard_days:
                is_delayed = True
            elif obj.overall_status == 'inspection' and days_in_inspection > standards.inspection_standard_days:
                is_delayed = True
            elif obj.overall_status == 'requirements' and days_in_requirements > standards.requirements_standard_days:
                is_delayed = True
            elif obj.overall_status == 'clearance' and days_in_clearance > standards.clearance_standard_days:
                is_delayed = True
        
        # Convert to dict and add analytics
        result = {
            'id': str(obj.id),
            'request_number': obj.request_number,
            'request_type': obj.request_type,
            'overall_status': obj.overall_status,
            'receiving_date_received': obj.receiving_date_received,
            'receiving_month': obj.receiving_month,
            'receiving_received_through': obj.receiving_received_through,
            'receiving_date_received_by_dept_head': obj.receiving_date_received_by_dept_head,
            'receiving_name': obj.receiving_name,
            'receiving_address': obj.receiving_address,
            'receiving_contact': obj.receiving_contact,
            'receiving_request_status': obj.receiving_request_status,
            'inspection_date_received_by_inspectors': obj.inspection_date_received_by_inspectors,
            'inspection_date_of_inspection': obj.inspection_date_of_inspection,
            'inspection_month': obj.inspection_month,
            'inspection_proponent_present': obj.inspection_proponent_present,
            'inspection_date_submitted_to_dept_head': obj.inspection_date_submitted_to_dept_head,
            'inspection_date_released_to_inspectors': obj.inspection_date_released_to_inspectors,
            'inspection_report_control_number': obj.inspection_report_control_number,
            'requirements_checklist': json.loads(obj.requirements_checklist) if obj.requirements_checklist else [],
            'requirements_remarks': obj.requirements_remarks,
            'requirements_status': obj.requirements_status,
            'requirements_date_completion': obj.requirements_date_completion,
            'clearance_date_issued': obj.clearance_date_issued,
            'clearance_date_of_payment': obj.clearance_date_of_payment,
            'clearance_control_number': obj.clearance_control_number,
            'clearance_or_number': obj.clearance_or_number,
            'clearance_date_received': obj.clearance_date_received,
            'clearance_status': obj.clearance_status,
            'denr_date_received_by_inspectors': obj.denr_date_received_by_inspectors,
            'denr_date_submitted_to_dept_head': obj.denr_date_submitted_to_dept_head,
            'denr_date_released_to_inspectors': obj.denr_date_released_to_inspectors,
            'denr_date_received': obj.denr_date_received,
            'denr_status': obj.denr_status,
            'created_by': str(obj.created_by) if obj.created_by else None,
            'editors': obj.editors if obj.editors else [],
            'created_at': obj.created_at,
            'updated_at': obj.updated_at,
            'days_in_receiving': days_in_receiving,
            'days_in_inspection': days_in_inspection,
            'days_in_requirements': days_in_requirements,
            'days_in_clearance': days_in_clearance,
            'total_days': total_days,
            'is_delayed': is_delayed,
            'is_archived': obj.is_archived,
            'receiving_standard_days': standards.receiving_standard_days if standards else None,
            'inspection_standard_days': standards.inspection_standard_days if standards else None,
            'requirements_standard_days': standards.requirements_standard_days if standards else None,
            'clearance_standard_days': standards.clearance_standard_days if standards else None,
        }
        
        return result
    
    def get_delayed_requests(self, db: Session, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all delayed requests"""
        requests = db.query(TreeRequest).filter(
            TreeRequest.overall_status.in_(['receiving', 'inspection', 'requirements', 'clearance'])
        ).offset(skip).limit(limit).all()
        
        delayed = []
        for req in requests:
            analytics = self.get_with_analytics(db, str(req.id))
            if analytics and analytics['is_delayed']:
                delayed.append(analytics)
        
        return delayed
    
    def get_analytics_summary(self, db: Session) -> Dict[str, Any]:
        """Get summary analytics for dashboard"""
        total_requests = db.query(func.count(TreeRequest.id)).scalar()
        
        status_counts = db.query(
            TreeRequest.overall_status,
            func.count(TreeRequest.id)
        ).group_by(TreeRequest.overall_status).all()
        
        delayed_count = len(self.get_delayed_requests(db, limit=1000))
        
        return {
            'total_requests': total_requests,
            'by_status': {status: count for status, count in status_counts},
            'delayed_count': delayed_count
        }


class CRUDProcessingStandards(CRUDBase[TreeRequestProcessingStandards, ProcessingStandardsCreate, ProcessingStandardsUpdate]):
    """CRUD for processing standards configuration"""
    
    def get_by_request_type(self, db: Session, *, request_type: str) -> Optional[TreeRequestProcessingStandards]:
        """Get standards for a specific request type"""
        return db.query(TreeRequestProcessingStandards).filter(
            TreeRequestProcessingStandards.request_type == request_type
        ).first()
    
    def get_all_standards(self, db: Session) -> List[TreeRequestProcessingStandards]:
        """Get all processing standards"""
        return db.query(TreeRequestProcessingStandards).all()
    
    def create_sync(self, db: Session, *, obj_in: ProcessingStandardsCreate) -> TreeRequestProcessingStandards:
        """Synchronous version of create for use with sync sessions"""
        db_obj = TreeRequestProcessingStandards(**obj_in.model_dump())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update_standards(self, db: Session, *, request_type: str, obj_in: ProcessingStandardsUpdate) -> Optional[TreeRequestProcessingStandards]:
        """Update standards for a specific request type"""
        obj = self.get_by_request_type(db, request_type=request_type)
        if not obj:
            return None
        
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(obj, field, value)
        
        db.commit()
        db.refresh(obj)
        return obj

    def remove_by_request_type(self, db: Session, *, request_type: str) -> bool:
        """Remove standards for a specific request type"""
        obj = self.get_by_request_type(db, request_type=request_type)
        if not obj:
            return False
        
        db.delete(obj)
        db.commit()
        return True


class CRUDDropdownOption(CRUDBase[TreeRequestDropdownOption, DropdownOptionCreate, DropdownOptionUpdate]):
    """CRUD operations for dropdown options"""
    
    def get_by_field(self, db: Session, *, field_name: str, active_only: bool = True) -> List[TreeRequestDropdownOption]:
        """Get all options for a specific field, ordered by display_order"""
        query = db.query(TreeRequestDropdownOption).filter(TreeRequestDropdownOption.field_name == field_name)
        if active_only:
            query = query.filter(TreeRequestDropdownOption.is_active == True)
        return query.order_by(TreeRequestDropdownOption.display_order).all()
    
    def create_option(self, db: Session, *, obj_in: DropdownOptionCreate) -> TreeRequestDropdownOption:
        """Create a new dropdown option"""
        db_obj = TreeRequestDropdownOption(**obj_in.model_dump())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update_option(self, db: Session, *, id: str, obj_in: DropdownOptionUpdate) -> Optional[TreeRequestDropdownOption]:
        """Update a dropdown option"""
        obj = db.query(TreeRequestDropdownOption).filter(TreeRequestDropdownOption.id == id).first()
        if not obj:
            return None
        
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(obj, field, value)
        
        db.commit()
        db.refresh(obj)
        return obj
    
    def delete_option(self, db: Session, *, id: str) -> bool:
        """Delete a dropdown option (or mark as inactive)"""
        obj = db.query(TreeRequestDropdownOption).filter(TreeRequestDropdownOption.id == id).first()
        if not obj:
            return False
        
        # Soft delete by marking as inactive
        obj.is_active = False
        db.commit()
        return True


tree_request = CRUDTreeRequest(TreeRequest)
processing_standards = CRUDProcessingStandards(TreeRequestProcessingStandards)
dropdown_options = CRUDDropdownOption(TreeRequestDropdownOption)
