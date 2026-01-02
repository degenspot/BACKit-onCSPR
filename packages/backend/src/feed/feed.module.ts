import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { Call } from '../calls/call.entity';
import { UserFollows } from '../users/user-follows.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Call, UserFollows])],
    providers: [FeedService],
    controllers: [FeedController],
})
export class FeedModule { }
