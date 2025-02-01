import React, { useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import styled from 'styled-components/native';
import { Course } from '../types/course';
import { CourseCard } from '../components/CourseCard';
import { FadeAnimation } from '../components/animations/FadeAnimation';
import { SlideAnimation } from '../components/animations/SlideAnimation';
import { LoadingAnimation } from '../components/animations/LoadingAnimation';
import { ListItemTransition } from '../components/animations/transitions/ListItemTransition';
import { PageTransition } from '../components/animations/transitions/PageTransition';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.md}px;
`;

const Header = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const Title = styled.Text`
  font-size: ${({ theme }) => theme.typography.h1.fontSize}px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const EmptyStateContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xl}px;
`;

const EmptyStateText = styled.Text`
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

// Données de test
const mockCourses: Course[] = [
  {
    id: '1',
    clientName: 'Jean Dupont',
    pickupAddress: '123 Rue de Paris, Paris',
    deliveryAddress: '456 Avenue des Champs-Élysées, Paris',
    status: 'en_attente',
    scheduledTime: '14:30',
  },
  {
    id: '2',
    clientName: 'Marie Martin',
    pickupAddress: '789 Boulevard Haussmann, Paris',
    deliveryAddress: '321 Rue de Rivoli, Paris',
    status: 'en_cours',
    scheduledTime: '15:00',
  },
  {
    id: '3',
    clientName: 'Pierre Durand',
    pickupAddress: '147 Avenue Montaigne, Paris',
    deliveryAddress: '258 Rue du Faubourg Saint-Honoré, Paris',
    status: 'terminée',
    scheduledTime: '13:45',
  },
];

export const CourseListScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simuler un chargement
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <FadeAnimation>
        <LoadingContainer>
          <LoadingAnimation size={12} />
        </LoadingContainer>
      </FadeAnimation>
    );
  }

  return (
    <PageTransition isVisible={true}>
      <Container>
        <SlideAnimation direction="down">
          <Header>
            <Title>Mes Courses</Title>
          </Header>
        </SlideAnimation>

        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <ListItemTransition index={index}>
              <CourseCard
                course={item}
                onPress={() => {
                  // Navigation vers le détail de la course
                  console.log('Navigation vers la course:', item.id);
                }}
              />
            </ListItemTransition>
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={() => (
            <FadeAnimation>
              <EmptyStateContainer>
                <EmptyStateText>
                  Aucune course disponible pour le moment
                </EmptyStateText>
              </EmptyStateContainer>
            </FadeAnimation>
          )}
        />
      </Container>
    </PageTransition>
  );
};
