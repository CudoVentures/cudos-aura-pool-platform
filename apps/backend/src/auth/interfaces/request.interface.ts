import { Request } from 'express';
import { UserInterface } from '../../user/interfaces/user.interface';
import { User } from '../../user/user.model';

export interface RequestWithUser extends Request {
    user: UserInterface;
}

export interface RequestWithSessionUser extends Request {
    sessionUser: User
}

export default RequestWithUser;
