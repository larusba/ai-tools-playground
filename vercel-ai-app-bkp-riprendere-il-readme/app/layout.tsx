export const metadata = {
  title: "AI Fullstack Demo",
  description: "Demo con Redis, Neo4j, Postgres, Pinecone, LlamaIndex",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", margin: 0, padding: 20 }}>
        <h1>AI Fullstack Demo</h1>
        {children}
      </body>
    </html>
  );
}
