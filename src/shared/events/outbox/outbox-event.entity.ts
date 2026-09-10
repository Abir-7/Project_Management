import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("outbox_events")
export class OutboxEvent {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100 })
  eventName!: string;

  @Column({ type: "jsonb" })
  payload!: Record<string, unknown>;

  @Column({ type: "integer", default: 0 })
  attempts!: number;

  @Column({ type: "integer", default: 5 })
  maxAttempts!: number;

  @Column({
    type: "timestamp with time zone",
    default: () => "CURRENT_TIMESTAMP",
  })
  nextAttemptAt!: Date;

  @Column({ type: "timestamp with time zone", nullable: true })
  processedAt!: Date | null;

  @Column({ type: "timestamp with time zone", nullable: true })
  failedAt!: Date | null;

  @Column({ type: "text", nullable: true })
  lastError!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
