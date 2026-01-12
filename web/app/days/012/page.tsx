import { getNotionData } from "./actions";
import NotionDisplay from "./NotionDisplay";

export default async function NotionBIPage() {
  const { success, data, error } = await getNotionData();

  if (!success) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center font-sans">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Connection Error
          </h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="text-left bg-white p-4 rounded border text-sm overflow-x-auto">
            <p className="font-bold mb-2">How to fix:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Open <code>web/.env.local</code>
              </li>
              <li>
                Add your <code>NOTION_KEY</code> (Internal Integration Secret)
              </li>
              <li>
                Add your <code>NOTION_DATABASE_ID</code>
              </li>
              <li>
                Make sure you've connected your integration to the database page
                in Notion
              </li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return <NotionDisplay data={data || []} />;
}
