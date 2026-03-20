export function proxyImageUrl(url: string, width: number, height: number, quality = 80): string {
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&h=${height}&output=webp&q=${quality}`;
}