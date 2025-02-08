import { Role } from './role';

export class User {
    id: string;
    username: string;
    password: string;
    identification: string;
    email: string;
    birthday: Date;
    role: Role;
    prefix: string;
    name: string;
    surname: string;
    fullname: string;
    token?: string;
    active_start: Date;
    active_end: Date;
    active: boolean;
    branch_id?: string;
    employee_id?: string;
    is_manager: boolean = false;
    avatar_path?: string;
    display_role: string;
    employee_list?: string[];
}
