import React, { useState } from 'react';
import {
  Card,
  DatePicker,
  Button,
  Table,
  Space,
  Select,
  Row,
  Col,
  Statistic,
  Progress,
  Tooltip,
  message,
} from 'antd';
import {
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  PrinterOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { useAPI } from '../../hooks/useAPI';
import { Bar, Pie } from '@ant-design/charts';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface ReportData {
  period: string;
  totalVehicles: number;
  availableVehicles: number;
  inUseVehicles: number;
  maintenanceVehicles: number;
  availabilityRate: number;
  utilizationRate: number;
  maintenanceRate: number;
  vehicleDetails: Array<{
    id: string;
    registrationNumber: string;
    type: string;
    availableHours: number;
    usedHours: number;
    maintenanceHours: number;
  }>;
}

const AvailabilityReport: React.FC = () => {
  const { api } = useAPI();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment]>([
    moment().startOf('month'),
    moment().endOf('month'),
  ]);
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vehicles/availability-report', {
        params: {
          startDate: dateRange[0].toISOString(),
          endDate: dateRange[1].toISOString(),
          groupBy,
        },
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Error loading report:', error);
      message.error('Erreur lors du chargement du rapport');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'excel' | 'pdf') => {
    try {
      const response = await api.get(`/vehicles/export-availability-report`, {
        params: {
          startDate: dateRange[0].toISOString(),
          endDate: dateRange[1].toISOString(),
          groupBy,
          format,
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: format === 'excel'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/pdf',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport-disponibilite-${moment().format('YYYY-MM-DD')}.${
        format === 'excel' ? 'xlsx' : 'pdf'
      }`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting report:', error);
      message.error('Erreur lors de l\'export du rapport');
    }
  };

  const columns = [
    {
      title: 'Période',
      dataIndex: 'period',
      key: 'period',
    },
    {
      title: 'Véhicules totaux',
      dataIndex: 'totalVehicles',
      key: 'totalVehicles',
      sorter: (a: any, b: any) => a.totalVehicles - b.totalVehicles,
    },
    {
      title: 'Disponibilité',
      dataIndex: 'availabilityRate',
      key: 'availabilityRate',
      render: (rate: number) => (
        <Tooltip title={`${rate.toFixed(1)}%`}>
          <Progress
            percent={rate}
            size="small"
            status={rate >= 70 ? 'success' : rate >= 40 ? 'normal' : 'exception'}
          />
        </Tooltip>
      ),
      sorter: (a: any, b: any) => a.availabilityRate - b.availabilityRate,
    },
    {
      title: 'Utilisation',
      dataIndex: 'utilizationRate',
      key: 'utilizationRate',
      render: (rate: number) => (
        <Tooltip title={`${rate.toFixed(1)}%`}>
          <Progress
            percent={rate}
            size="small"
            status={rate >= 70 ? 'success' : rate >= 40 ? 'normal' : 'exception'}
          />
        </Tooltip>
      ),
      sorter: (a: any, b: any) => a.utilizationRate - b.utilizationRate,
    },
    {
      title: 'Maintenance',
      dataIndex: 'maintenanceRate',
      key: 'maintenanceRate',
      render: (rate: number) => (
        <Tooltip title={`${rate.toFixed(1)}%`}>
          <Progress
            percent={rate}
            size="small"
            status={rate <= 10 ? 'success' : rate <= 20 ? 'normal' : 'exception'}
          />
        </Tooltip>
      ),
      sorter: (a: any, b: any) => a.maintenanceRate - b.maintenanceRate,
    },
  ];

  const renderCharts = () => {
    if (!reportData) return null;

    const pieData = [
      { type: 'Disponibles', value: reportData.availableVehicles },
      { type: 'En service', value: reportData.inUseVehicles },
      { type: 'En maintenance', value: reportData.maintenanceVehicles },
    ];

    return (
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Répartition des véhicules">
            <Pie
              data={pieData}
              angleField="value"
              colorField="type"
              radius={0.8}
              label={{
                type: 'outer',
                content: '{name} {percentage}',
              }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Taux d'utilisation par type de véhicule">
            <Bar
              data={reportData.vehicleDetails}
              xField="registrationNumber"
              yField="usedHours"
              seriesField="type"
              isStack={true}
              label={{
                position: 'middle',
                content: (item: any) => `${item.usedHours}h`,
              }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <Card title="Rapport de disponibilité des véhicules">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Row gutter={16}>
          <Col span={8}>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [moment.Moment, moment.Moment])}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={8}>
            <Select
              value={groupBy}
              onChange={setGroupBy}
              style={{ width: '100%' }}
            >
              <Option value="day">Par jour</Option>
              <Option value="week">Par semaine</Option>
              <Option value="month">Par mois</Option>
            </Select>
          </Col>
          <Col span={8}>
            <Space>
              <Button type="primary" onClick={loadReport} loading={loading}>
                Générer le rapport
              </Button>
              <Button
                icon={<FileExcelOutlined />}
                onClick={() => exportReport('excel')}
              >
                Excel
              </Button>
              <Button
                icon={<FilePdfOutlined />}
                onClick={() => exportReport('pdf')}
              >
                PDF
              </Button>
              <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
                Imprimer
              </Button>
            </Space>
          </Col>
        </Row>

        {reportData && (
          <>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Taux de disponibilité moyen"
                  value={reportData.availabilityRate}
                  suffix="%"
                  precision={1}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Taux d'utilisation moyen"
                  value={reportData.utilizationRate}
                  suffix="%"
                  precision={1}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Véhicules en service"
                  value={reportData.inUseVehicles}
                  suffix={`/ ${reportData.totalVehicles}`}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Véhicules en maintenance"
                  value={reportData.maintenanceVehicles}
                  suffix={`/ ${reportData.totalVehicles}`}
                />
              </Col>
            </Row>

            {renderCharts()}

            <Table
              columns={columns}
              dataSource={[reportData]}
              loading={loading}
              pagination={false}
            />
          </>
        )}
      </Space>
    </Card>
  );
};

export default AvailabilityReport;
