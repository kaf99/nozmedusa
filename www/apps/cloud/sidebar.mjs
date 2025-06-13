/** @type {import('types').Sidebar.RawSidebar[]} */
export const sidebar = [
  {
    sidebar_id: "cloud",
    title: "Cloud",
    items: [
      {
        type: "link",
        path: "/",
        title: "Introduction",
      },
      {
        type: "separator",
      },
      {
        type: "category",
        title: "Basics",
        initialOpen: true,
        children: [
          {
            type: "link",
            title: "Organizations",
            path: "/organizations",
          },
        ],
      },
    ],
  },
]
