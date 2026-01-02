import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique, Index } from 'typeorm';

@Entity('user_follows')
@Unique(['followerWallet', 'followingWallet'])
@Index(['followerWallet'])
@Index(['followingWallet'])
export class UserFollows {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    followerWallet: string;

    @Column()
    followingWallet: string;

    @CreateDateColumn()
    createdAt: Date;
}
