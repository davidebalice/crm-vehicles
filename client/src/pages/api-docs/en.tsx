import { FC, useState, useEffect } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { Link } from "wouter";

const ApiDocsEN: FC = () => {
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDocumentation = async () => {
      try {
        // Fetch documentation HTML directly from server
        const response = await fetch("/api/documentation/en");
        const html = await response.text();
        setHtmlContent(html);
      } catch (error) {
        console.error("Error loading documentation:", error);
        // Fallback to raw markdown
        try {
          const fallbackResponse = await fetch("/CATALOG_API_EN.md");
          const markdown = await fallbackResponse.text();
          setHtmlContent(`<pre style="white-space: pre-wrap; font-family: monospace; font-size: 0.875rem;">${markdown}</pre>`);
        } catch (e) {
          console.error("Error loading fallback:", e);
          setHtmlContent("<p>Unable to load documentation.</p>");
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
              <span>Back</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold">Vehicle Catalog API Documentation (EN)</h1>
        </div>
        <a href="/CATALOG_API_EN.md" download className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md flex items-center">
          <Download className="h-4 w-4 mr-2" />
          <span>Download Markdown</span>
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

export default ApiDocsEN;