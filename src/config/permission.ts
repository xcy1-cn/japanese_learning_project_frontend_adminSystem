export type AdminRole = "admin" | "author";

export interface MenuItem {
  path: string;
  title: string;
  roles: AdminRole[];
}

export const menuList: MenuItem[] = [
  {
    path: "/dashboard",
    title: "控制台",
    roles: ["admin", "author"],
  },
  {
    path: "/articles",
    title: "文章管理",
    roles: ["admin", "author"],
  },
  {
    path: "/sentences",
    title: "句子管理",
    roles: ["admin", "author"],
  },
  {
    path: "/vocabularies",
    title: "词汇管理",
    roles: ["admin", "author"],
  },
  {
    path: "/grammar-points",
    title: "语法管理",
    roles: ["admin", "author"],
  },
  {
    path: "/questions",
    title: "题目管理",
    roles: ["admin"],
  },
  {
    path: "/import",
    title: "批量导入",
    roles: ["admin"],
  },
];

export const hasRolePermission = (
  role: string | null,
  roles: AdminRole[],
) => {
  if (!role) return false;

  const normalizedRole = role.trim().toLowerCase();

  return roles.includes(normalizedRole as AdminRole);
};