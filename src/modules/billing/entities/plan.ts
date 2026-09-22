import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import type { BillingInterval } from "../constants/billing-interval.js";

@Entity("plans")
export class Plan {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100, unique: true })
  name!: string;

  @Column({ type: "varchar", length: 100, unique: true })
  code!: string;

  @Column({ type: "integer" })
  price!: number;

  @Column({ type: "varchar", length: 10 })
  currency!: string;

  @Column({ type: "varchar", length: 20 })
  interval!: BillingInterval;

  @Column({ type: "varchar", length: 255, unique: true })
  stripePriceId!: string;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
