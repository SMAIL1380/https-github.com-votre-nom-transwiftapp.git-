import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationsSystem1704585397000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Création des types enum
    await queryRunner.query(`
      CREATE TYPE notification_type_enum AS ENUM (
        'delivery',
        'maintenance',
        'fuel',
        'message',
        'system',
        'alert'
      );

      CREATE TYPE notification_priority_enum AS ENUM (
        'low',
        'normal',
        'high',
        'urgent'
      );

      CREATE TYPE notification_status_enum AS ENUM (
        'pending',
        'sent',
        'failed',
        'read',
        'deleted'
      );
    `);

    // Création de la table des notifications
    await queryRunner.query(`
      CREATE TABLE notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        type notification_type_enum NOT NULL DEFAULT 'system',
        priority notification_priority_enum NOT NULL DEFAULT 'normal',
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        data JSONB,
        status notification_status_enum NOT NULL DEFAULT 'pending',
        read BOOLEAN NOT NULL DEFAULT false,
        read_at TIMESTAMP,
        scheduled_for TIMESTAMP,
        retry_count INTEGER NOT NULL DEFAULT 0,
        last_retry_at TIMESTAMP,
        error TEXT,
        tags TEXT[] DEFAULT '{}',
        actions JSONB,
        group_id VARCHAR(255),
        group_order INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Index pour les recherches fréquentes
      CREATE INDEX idx_notifications_user_status ON notifications(user_id, status);
      CREATE INDEX idx_notifications_type_created ON notifications(type, created_at);
      CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for) 
        WHERE status = 'pending';
      CREATE INDEX idx_notifications_tags ON notifications USING gin(tags);
    `);

    // Création de la table des templates de notification
    await queryRunner.query(`
      CREATE TABLE notification_templates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL UNIQUE,
        type notification_type_enum NOT NULL,
        title_template TEXT NOT NULL,
        body_template TEXT NOT NULL,
        default_priority notification_priority_enum DEFAULT 'normal',
        default_actions JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Fonction de mise à jour du timestamp
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Triggers pour updated_at
    await queryRunner.query(`
      CREATE TRIGGER update_notifications_updated_at
        BEFORE UPDATE ON notifications
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_notification_templates_updated_at
        BEFORE UPDATE ON notification_templates
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Fonction pour notifier les clients en temps réel
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION notify_new_notification()
      RETURNS TRIGGER AS $$
      BEGIN
        PERFORM pg_notify(
          'new_notification',
          json_build_object(
            'id', NEW.id,
            'userId', NEW.user_id,
            'type', NEW.type,
            'title', NEW.title
          )::text
        );
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Trigger pour les notifications en temps réel
    await queryRunner.query(`
      CREATE TRIGGER notify_after_notification_insert
        AFTER INSERT ON notifications
        FOR EACH ROW
        EXECUTE FUNCTION notify_new_notification();
    `);

    // Insertion des templates par défaut
    await queryRunner.query(`
      INSERT INTO notification_templates (name, type, title_template, body_template, default_priority, default_actions) 
      VALUES 
        (
          'new_delivery',
          'delivery',
          'Nouvelle livraison #{{deliveryId}}',
          'Une nouvelle livraison est disponible pour {{address}}',
          'high',
          '[{"id": "accept", "title": "Accepter", "type": "action"}, {"id": "reject", "title": "Refuser", "type": "action"}]'
        ),
        (
          'maintenance_reminder',
          'maintenance',
          'Maintenance requise - {{vehicleNumber}}',
          'Le véhicule {{vehicleNumber}} nécessite une maintenance {{maintenanceType}} dans {{daysUntil}} jours',
          'normal',
          null
        ),
        (
          'low_fuel',
          'fuel',
          'Niveau de carburant bas',
          'Le véhicule {{vehicleNumber}} a un niveau de carburant de {{fuelLevel}}%',
          'high',
          null
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Suppression des triggers
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS notify_after_notification_insert ON notifications;
      DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
      DROP TRIGGER IF EXISTS update_notification_templates_updated_at ON notification_templates;
    `);

    // Suppression des fonctions
    await queryRunner.query(`
      DROP FUNCTION IF EXISTS notify_new_notification();
      DROP FUNCTION IF EXISTS update_updated_at_column();
    `);

    // Suppression des tables
    await queryRunner.query(`
      DROP TABLE IF EXISTS notifications;
      DROP TABLE IF EXISTS notification_templates;
    `);

    // Suppression des types enum
    await queryRunner.query(`
      DROP TYPE IF EXISTS notification_type_enum;
      DROP TYPE IF EXISTS notification_priority_enum;
      DROP TYPE IF EXISTS notification_status_enum;
    `);
  }
}
