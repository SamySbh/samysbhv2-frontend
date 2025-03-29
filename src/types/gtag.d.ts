interface Window {
    gtag: (
        command: string,
        action: string | any,
        params?: {
            [key: string]: any;
        }
    ) => void;
    dataLayer: any[];
}