import NextDocument, { Head, Html, Main, NextScript } from "next/document";

export default class Document extends NextDocument {
    render() {
        return (
            <Html>
                <Head>
                    <title>NFT-OթͲ</title>
                    <meta name="description" content="NFT-OթͲ is a marketplace for NFT Options. Here you can list your request to hedge NFTs in your collection against floor price downside"></meta>
                    <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                    <link
                        rel="icon"
                        href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>"
                    />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
