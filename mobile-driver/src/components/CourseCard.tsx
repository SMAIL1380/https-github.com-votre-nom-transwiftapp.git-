import React from 'react';
import styled from 'styled-components/native';
import { Course } from '../types/course';

const Card = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
`;

const ClientName = styled.Text`
  font-size: ${({ theme }) => theme.typography.h2.fontSize}px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

const AddressText = styled.Text`
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

const StatusContainer = styled.View<{ status: Course['status'] }>`
  background-color: ${({ status, theme }) => {
    switch (status) {
      case 'en_attente':
        return theme.colors.warning + '40';
      case 'en_cours':
        return theme.colors.primary + '40';
      case 'terminée':
        return theme.colors.success + '40';
    }
  }};
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
  align-self: flex-start;
`;

const StatusText = styled.Text<{ status: Course['status'] }>`
  color: ${({ status, theme }) => {
    switch (status) {
      case 'en_attente':
        return theme.colors.warning;
      case 'en_cours':
        return theme.colors.primary;
      case 'terminée':
        return theme.colors.success;
    }
  }};
  font-weight: bold;
`;

const TimeText = styled.Text`
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

interface CourseCardProps {
  course: Course;
  onPress?: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onPress }) => {
  const getStatusText = (status: Course['status']) => {
    switch (status) {
      case 'en_attente':
        return 'En attente';
      case 'en_cours':
        return 'En cours';
      case 'terminée':
        return 'Terminée';
    }
  };

  return (
    <Card onPress={onPress}>
      <ClientName>{course.clientName}</ClientName>
      <AddressText>Départ: {course.pickupAddress}</AddressText>
      <AddressText>Arrivée: {course.deliveryAddress}</AddressText>
      <StatusContainer status={course.status}>
        <StatusText status={course.status}>
          {getStatusText(course.status)}
        </StatusText>
      </StatusContainer>
      <TimeText>Prévu pour: {course.scheduledTime}</TimeText>
    </Card>
  );
};
