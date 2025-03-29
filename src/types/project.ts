import { Tag } from "./tag";

export interface Project {
    title: string;
    description: string;
    image: string;
    tags: Tag[]
}