export default {
    title: "SamySBH | Documentation",
    description: "Documentation complète de l'API et du frontend",
    head: [
        ['link', { rel: 'icon', type: 'image/svg+xml', href: '/assets/logos/LogoSamySbhAvecFond.svg' }]
    ],
    themeConfig: {
        logo: "/assets/logos/LogoSamySbhAvecFond.svg",
        nav: [
            { text: "Accueil", link: "/" },
            { text: "Guide", link: "/guide/" },
            { text: "API", link: "/api/" }
        ],
        sidebar: {
            "/guide/": [
                {
                    text: "Introduction",
                    items: [
                        { text: "Mise en route", link: "/guide/getting-started" },
                        { text: "Architecture", link: "/guide/architecture" }
                    ]
                },
                {
                    text: "Fonctionnalités",
                    items: [
                        { text: "Authentification", link: "/guide/auth" },
                        { text: "Services", link: "/guide/services" },
                        { text: "Commandes", link: "/guide/orders" },
                        { text: "Paiements", link: "/guide/payments" }
                    ]
                }
            ],
            "/api/": [
                {
                    text: "API Reference",
                    items: [
                        { text: "Auth", link: "/api/auth" },
                        { text: "Users", link: "/api/users" },
                        { text: "Services", link: "/api/services" },
                        { text: "Orders", link: "/api/orders" },
                        { text: "OrderItems", link: "/api/order-items" },
                        { text: "Payments", link: "/api/payments" }
                    ]
                }
            ]
        }
    }
};