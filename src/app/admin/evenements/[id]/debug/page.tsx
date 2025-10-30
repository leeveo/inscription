'use client'

import { useRouter, useParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

// Update the DebugParams interface to make id optional
interface DebugParams {
  id?: string; // Make id optional with the ? modifier
  // Add other parameters if needed
}

// Update the debug info type
type DebugInfoType = {
  params: DebugParams; // Replace 'any' with the specific type
  pathname: string;
  paramsIdType: string;
  pathSegments: string[];
  extractedId: string | null;
}

export default function DebugPage() {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  
  // Update the state initialization to match
  const [debugInfo, setDebugInfo] = useState<DebugInfoType | null>(null)
  
  useEffect(() => {
    // Extract path segments
    const segments = pathname?.split('/') || []
    const possibleId = segments[segments.length - 2]
    
    // Then the assignment will work correctly
    setDebugInfo({
      params: params as DebugParams,
      pathname: pathname,
      paramsIdType: params.id ? typeof params.id : 'undefined',
      pathSegments: segments,
      extractedId: possibleId
    })
  }, [params, pathname])
  
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Debug Route Parameters</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Route Information</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700">Pathname:</h3>
            <pre className="mt-1 bg-gray-100 p-2 rounded">{debugInfo?.pathname}</pre>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700">Path Segments:</h3>
            <pre className="mt-1 bg-gray-100 p-2 rounded">
              {JSON.stringify(debugInfo?.pathSegments, null, 2)}
            </pre>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700">Params Object:</h3>
            <pre className="mt-1 bg-gray-100 p-2 rounded">
              {JSON.stringify(debugInfo?.params, null, 2)}
            </pre>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700">params.id Type:</h3>
            <pre className="mt-1 bg-gray-100 p-2 rounded">{debugInfo?.paramsIdType}</pre>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700">Extracted ID from Path:</h3>
            <pre className="mt-1 bg-gray-100 p-2 rounded">{debugInfo?.extractedId}</pre>
          </div>
        </div>
        
        <div className="mt-6">
          <button 
            onClick={() => router.back()} 
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
