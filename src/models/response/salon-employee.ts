import {Gender} from '@enums/gender';

export interface SalonEmployee {
    id: string;
    displayName: string;
    photoUrl: string;
    gender: Gender;
}