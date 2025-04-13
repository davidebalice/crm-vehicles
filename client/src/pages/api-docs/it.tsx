import { FC, useState, useEffect } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { Link } from "wouter";

const ApiDocsIT: FC = () => {
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDocumentation = async () => {
      try {
        // Fetchiamo direttamente la documentazione HTML dal server
        const response = await fetch("/api/documentation/it");
        const html = await response.text();
        setHtmlContent(html);
      } catch (error) {
        console.error("Errore nel caricamento della documentazione:", error);
        // In caso di errore, mostriamo il markdown raw come fallback
        try {
          const fallbackResponse = await fetch("/CATALOG_API_IT.md");
          const markdown = await fallbackResponse.text();
          setHtmlContent(`<pre style="white-space: pre-wrap; font-family: monospace; font-size: 0.875rem;">${markdown}</pre>`);
        } catch (e) {
          console.error("Errore nel caricamento del fallback:", e);
          setHtmlContent("<p>Impossibile caricare la documentazione.</p>");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentation();
  }, []);

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link href="/settings">
            <div className="flex items-center text-primary hover:text-primary-dark cursor-pointer mr-4">
              <ArrowLeft className="h-5 w-5 mr-1" />
              <span>Indietro</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold">Documentazione API Catalogo (IT)</h1>
        </div>
        <a href="/CATALOG_API_IT.md" download className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md flex items-center">
          <Download className="h-4 w-4 mr-2" />
          <span>Scarica Markdown</span>
        </a>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border border-gray-200 dark:border-gray-700 overflow-auto">
          <div 
            className="documentation-content prose dark:prose-invert max-w-none" 
            dangerouslySetInnerHTML={{ __html: htmlContent }} 
          />
        </div>
      )}
    </div>
  );
};

export default ApiDocsIT;