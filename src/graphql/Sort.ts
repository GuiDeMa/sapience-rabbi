import { enumType } from "nexus" 

export const Sort = enumType({
    name: "Sort",
    members: ["asc", "desc"],
});