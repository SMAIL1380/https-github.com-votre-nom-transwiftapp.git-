import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, Tag, Timeline, message } from 'antd';
import moment from 'moment';
import { CarOutlined, ToolOutlined } from '@ant-design/icons';
import { useAPI } from '../../hooks/useAPI';

interface TimeSlot {
  id: string;
  time: string;
  events: Event[];
}

interface Event {
  id: string;
  type: 'delivery' | 'maintenance';
  start: string;
  end: string;
  details: any;
  vehicleId: string;
}

interface Props {
  events: Event[];
  onEventUpdate: (event: Event, newTime: string) => Promise<void>;
}

const DraggableTimeline: React.FC<Props> = ({ events, onEventUpdate }) => {
  const { api } = useAPI();
  const [loading, setLoading] = useState<string | null>(null);

  // Créer des créneaux horaires de 30 minutes
  const createTimeSlots = () => {
    const slots: TimeSlot[] = [];
    const startTime = moment().startOf('day');
    
    for (let i = 0; i < 48; i++) {
      const time = startTime.clone().add(i * 30, 'minutes');
      slots.push({
        id: `slot-${i}`,
        time: time.format('HH:mm'),
        events: events.filter(event => 
          moment(event.start).format('HH:mm') === time.format('HH:mm')
        ),
      });
    }
    
    return slots;
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { draggableId, source, destination } = result;
    const event = events.find(e => e.id === draggableId);
    if (!event) return;

    const sourceTime = source.droppableId;
    const destinationTime = destination.droppableId;

    if (sourceTime === destinationTime) return;

    setLoading(draggableId);

    try {
      const newStartTime = moment(event.start)
        .hour(parseInt(destinationTime.split(':')[0]))
        .minute(parseInt(destinationTime.split(':')[1]));

      const duration = moment(event.end).diff(moment(event.start));
      const newEndTime = newStartTime.clone().add(duration);

      // Vérifier la disponibilité
      const availabilityCheck = await api.post(`/vehicles/check-availability`, {
        vehicleId: event.vehicleId,
        startTime: newStartTime.toISOString(),
        endTime: newEndTime.toISOString(),
        excludeEventId: event.id,
      });

      if (!availabilityCheck.data.available) {
        message.error('Ce créneau horaire n\'est pas disponible');
        return;
      }

      await onEventUpdate(event, newStartTime.toISOString());
      message.success('Événement déplacé avec succès');
    } catch (error) {
      console.error('Error updating event:', error);
      message.error('Erreur lors du déplacement de l\'événement');
    } finally {
      setLoading(null);
    }
  };

  const timeSlots = createTimeSlots();

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div style={{ padding: 16 }}>
        <Timeline mode="left">
          {timeSlots.map(slot => (
            <Timeline.Item
              key={slot.id}
              label={
                <div style={{ width: 60, textAlign: 'right' }}>
                  {slot.time}
                </div>
              }
            >
              <Droppable droppableId={slot.time}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ minHeight: 30 }}
                  >
                    {slot.events.map((event, index) => (
                      <Draggable
                        key={event.id}
                        draggableId={event.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: loading === event.id ? 0.5 : 1,
                            }}
                          >
                            <Card
                              size="small"
                              style={{
                                marginBottom: 8,
                                background: snapshot.isDragging ? '#f0f0f0' : '#fff',
                              }}
                            >
                              <Tag color={event.type === 'delivery' ? 'blue' : 'orange'}>
                                {event.type === 'delivery' ? (
                                  <CarOutlined />
                                ) : (
                                  <ToolOutlined />
                                )}
                                {' '}
                                {event.type === 'delivery' ? 'Livraison' : 'Maintenance'}
                              </Tag>
                              <div style={{ marginTop: 8 }}>
                                {event.type === 'delivery' ? (
                                  <>
                                    <div>De: {event.details.pickupAddress}</div>
                                    <div>À: {event.details.deliveryAddress}</div>
                                  </>
                                ) : (
                                  <div>{event.details.description}</div>
                                )}
                              </div>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Timeline.Item>
          ))}
        </Timeline>
      </div>
    </DragDropContext>
  );
};

export default DraggableTimeline;
