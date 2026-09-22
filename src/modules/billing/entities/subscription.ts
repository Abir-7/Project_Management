import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import type { SubscriptionStatus } from "../constants/subscription-status.js";

@Entity("subscriptions")
export class Subscription {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  /**
   * User who initiated the checkout.
   * This is the purchaser before an organization exists.
   */
  @Column({ type: "uuid" })
  userId!: string;

  /**
   * Set after the organization is created.
   */
  @Column({ type: "uuid", nullable: true })
  organizationId!: string | null;

  @Column({ type: "uuid" })
  planId!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  stripeCustomerId!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  stripeSubscriptionId!: string;

  @Column({ type: "varchar", length: 50 })
  status!: SubscriptionStatus;

  @Column({ type: "timestamp with time zone", nullable: true })
  currentPeriodStart!: Date | null;

  @Column({ type: "timestamp with time zone", nullable: true })
  currentPeriodEnd!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
