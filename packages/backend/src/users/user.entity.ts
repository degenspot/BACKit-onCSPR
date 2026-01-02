import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn()
  wallet: string;

  @Column({ nullable: true })
  smartAccount: string;

  @Column({ nullable: true })
  displayName: string;

  @Column({ nullable: true, unique: true })
  handle: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  avatarCid: string;

  @CreateDateColumn()
  createdAt: Date;
}
