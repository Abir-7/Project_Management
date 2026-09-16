import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import type { OrganizationRole } from "../../../contracts/types/organization-role.js";

@Entity("organization_memberships")
@Unique(["userId", "organizationId"])
export class OrganizationMembership {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "uuid" })
  organizationId!: string;

  @Column({ type: "uuid", nullable: true })
  branchId!: string | null;

  @Column({ type: "varchar", length: 50 })
  role!: OrganizationRole;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
