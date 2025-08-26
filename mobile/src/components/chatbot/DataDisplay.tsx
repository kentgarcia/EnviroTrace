import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from "react-native";
import Icon from "../icons/Icon";
import { DataQueryResult, ChatAction } from "../../core/api/enhanced-chatbot-service";

interface DataDisplayProps {
    data: DataQueryResult;
    onActionPress?: (action: ChatAction) => void;
}

export default function DataDisplay({ data, onActionPress }: DataDisplayProps) {
    const renderTable = () => {
        if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Icon name="database" size={24} color="#999" />
                    <Text style={styles.emptyText}>No data available</Text>
                </View>
            );
        }

        const items = data.data.slice(0, 5); // Show first 5 items
        const firstItem = items[0];
        const keys = Object.keys(firstItem).slice(0, 3); // Show first 3 columns

        return (
            <View style={styles.tableContainer}>
                {/* Header */}
                <View style={styles.tableHeader}>
                    {keys.map((key) => (
                        <Text key={key} style={styles.tableHeaderText}>
                            {key.replace(/_/g, ' ').toUpperCase()}
                        </Text>
                    ))}
                </View>

                {/* Rows */}
                {items.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                        {keys.map((key) => (
                            <Text key={key} style={styles.tableCellText}>
                                {String(item[key] || '—').substring(0, 20)}
                                {String(item[key] || '').length > 20 ? '...' : ''}
                            </Text>
                        ))}
                    </View>
                ))}

                {data.metadata?.totalRecords && data.metadata.totalRecords > 5 && (
                    <View style={styles.tableFooter}>
                        <Text style={styles.tableFooterText}>
                            Showing 5 of {data.metadata.totalRecords} records
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    const renderSummary = () => {
        if (!data.data || typeof data.data !== 'object') {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No summary data available</Text>
                </View>
            );
        }

        const entries = Object.entries(data.data).slice(0, 8); // Show first 8 fields

        return (
            <View style={styles.summaryContainer}>
                {entries.map(([key, value]) => (
                    <View key={key} style={styles.summaryRow}>
                        <Text style={styles.summaryKey}>
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                        </Text>
                        <Text style={styles.summaryValue}>
                            {String(value || '—')}
                        </Text>
                    </View>
                ))}
            </View>
        );
    };

    const renderChart = () => {
        // For now, show a placeholder for chart data
        // In a real implementation, you'd use a charting library
        return (
            <View style={styles.chartContainer}>
                <Icon name="bar-chart-3" size={48} color="#2E7D32" />
                <Text style={styles.chartText}>Chart visualization</Text>
                <Text style={styles.chartSubtext}>
                    {data.metadata?.totalRecords || 0} data points
                </Text>
            </View>
        );
    };

    const renderAlert = () => {
        return (
            <View style={styles.alertContainer}>
                <Icon name="alert-triangle" size={24} color="#ff9800" />
                <Text style={styles.alertText}>{data.data?.message || 'Alert notification'}</Text>
            </View>
        );
    };

    const renderContent = () => {
        switch (data.type) {
            case 'table':
                return renderTable();
            case 'summary':
                return renderSummary();
            case 'chart':
                return renderChart();
            case 'alert':
                return renderAlert();
            default:
                return renderSummary();
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Icon name="database" size={16} color="#2E7D32" />
                <Text style={styles.title}>{data.title}</Text>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} horizontal showsHorizontalScrollIndicator={false}>
                {renderContent()}
            </ScrollView>

            {/* Metadata */}
            {data.metadata && (
                <View style={styles.metadata}>
                    {data.metadata.source && (
                        <Text style={styles.metadataText}>
                            Source: {data.metadata.source}
                        </Text>
                    )}
                    {data.metadata.dateRange && (
                        <Text style={styles.metadataText}>
                            Period: {data.metadata.dateRange}
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
}

interface ActionButtonsProps {
    actions: ChatAction[];
    onActionPress: (action: ChatAction) => void;
}

export function ActionButtons({ actions, onActionPress }: ActionButtonsProps) {
    const handleActionPress = (action: ChatAction) => {
        if (action.type === 'confirmation') {
            Alert.alert(
                'Confirm Action',
                `Are you sure you want to ${action.label.toLowerCase()}?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Confirm', onPress: () => onActionPress(action) }
                ]
            );
        } else {
            onActionPress(action);
        }
    };

    return (
        <View style={actionStyles.container}>
            {actions.map((action) => (
                <TouchableOpacity
                    key={action.id}
                    style={[
                        actionStyles.button,
                        action.type === 'confirmation' && actionStyles.confirmationButton
                    ]}
                    onPress={() => handleActionPress(action)}
                >
                    <Text style={[
                        actionStyles.buttonText,
                        action.type === 'confirmation' && actionStyles.confirmationText
                    ]}>
                        {action.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        margin: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
    },
    content: {
        maxHeight: 200,
    },

    // Table Styles
    tableContainer: {
        padding: 12,
    },
    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#dee2e6',
    },
    tableHeaderText: {
        flex: 1,
        fontSize: 12,
        fontWeight: '600',
        color: '#6c757d',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f9fa',
    },
    tableCellText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
    },
    tableFooter: {
        paddingTop: 8,
        alignItems: 'center',
    },
    tableFooterText: {
        fontSize: 12,
        color: '#6c757d',
        fontStyle: 'italic',
    },

    // Summary Styles
    summaryContainer: {
        padding: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f9fa',
    },
    summaryKey: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: '#495057',
    },
    summaryValue: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        textAlign: 'right',
    },

    // Chart Styles
    chartContainer: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chartText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginTop: 8,
    },
    chartSubtext: {
        fontSize: 12,
        color: '#6c757d',
        marginTop: 4,
    },

    // Alert Styles
    alertContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff3cd',
        borderLeftWidth: 4,
        borderLeftColor: '#ff9800',
    },
    alertText: {
        flex: 1,
        fontSize: 14,
        color: '#856404',
        marginLeft: 12,
    },

    // Empty State
    emptyState: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#6c757d',
        marginTop: 8,
    },

    // Metadata
    metadata: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#f8f9fa',
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    metadataText: {
        fontSize: 12,
        color: '#6c757d',
        marginBottom: 2,
    },
});

const actionStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 8,
        gap: 8,
    },
    button: {
        backgroundColor: '#2E7D32',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    confirmationButton: {
        backgroundColor: '#ff9800',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    confirmationText: {
        color: '#fff',
    },
});
