import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("email_verification_tokens")
export class EmailVerificationToken {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  tokenHash!: string;

  @Column({ type: "timestamp with time zone" })
  expiresAt!: Date;

  @Column({ type: "timestamp with time zone", nullable: true })
  usedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
