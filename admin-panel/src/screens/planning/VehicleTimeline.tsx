import React from 'react';
import { Timeline, Card, Tag, Tooltip } from 'antd';
import moment from 'moment';
import 'moment/locale/fr';
import { ClockCircleOutlined, CarOutlined, ToolOutlined } from '@ant-design/icons';

moment.locale('fr');

interface Event {
  type: 'delivery' | 'maintenance';
  start: string;
  end: string;
  details: any;
}

interface Props {
  events: Event[];
  onEventClick: (event: Event) => void;
}

const VehicleTimeline: React.FC<Props> = ({ events, onEventClick }) => {
  const sortedEvents = [...events].sort(
    (a, b) => moment(a.start).valueOf() - moment(b.start).valueOf(),
  );

  const getTimeRange = (event: Event) => {
    const start = moment(event.start).format('HH:mm');
    const end = moment(event.end).format('HH:mm');
    return `${start} - ${end}`;
  };

  const getEventColor = (event: Event) => {
    return event.type === 'delivery' ? 'blue' : 'orange';
  };

  const getEventIcon = (event: Event) => {
    return event.type === 'delivery' ? <CarOutlined /> : <ToolOutlined />;
  };

  const renderEventContent = (event: Event) => {
    if (event.type === 'delivery') {
      const { pickupAddress, deliveryAddress } = event.details;
      return (
        <>
          <div>
            <strong>Collecte :</strong> {pickupAddress}
          </div>
          <div>
            <strong>Livraison :</strong> {deliveryAddress}
          </div>
        </>
      );
    } else {
      const { description, serviceProvider } = event.details;
      return (
        <>
          <div>{description}</div>
          {serviceProvider && (
            <div>
              <strong>Prestataire :</strong> {serviceProvider}
            </div>
          )}
        </>
      );
    }
  };

  const groupEventsByDate = () => {
    const groups = new Map<string, Event[]>();
    
    sortedEvents.forEach(event => {
      const date = moment(event.start).format('YYYY-MM-DD');
      if (!groups.has(date)) {
        groups.set(date, []);
      }
      groups.get(date).push(event);
    });

    return groups;
  };

  const eventGroups = groupEventsByDate();

  return (
    <div style={{ padding: 16 }}>
      {Array.from(eventGroups.entries()).map(([date, dateEvents]) => (
        <Card
          key={date}
          title={moment(date).format('dddd D MMMM YYYY')}
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Timeline mode="left">
            {dateEvents.map((event, index) => (
              <Timeline.Item
                key={index}
                color={getEventColor(event)}
                dot={getEventIcon(event)}
                label={
                  <div style={{ width: 100, textAlign: 'right' }}>
                    {getTimeRange(event)}
                  </div>
                }
              >
                <Card
                  size="small"
                  style={{ marginBottom: 8, cursor: 'pointer' }}
                  onClick={() => onEventClick(event)}
                >
                  <Tag color={getEventColor(event)} style={{ marginBottom: 8 }}>
                    {event.type === 'delivery' ? 'Livraison' : 'Maintenance'}
                  </Tag>
                  {renderEventContent(event)}
                </Card>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      ))}

      {eventGroups.size === 0 && (
        <Card>
          <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>
            Aucun événement planifié
          </div>
        </Card>
      )}
    </div>
  );
};

export default VehicleTimeline;
