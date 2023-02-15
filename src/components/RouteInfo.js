import { useState, useEffect } from 'react';

export function RouteInfo(props) {
  const [route, setRoute] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_BING_MAPS_API_KEY;
    const startPoint = 'Cal Poly, CA';
    const endPoint = '776 Chorro St, San Luis Obispo, CA';

    fetch(`https://dev.virtualearth.net/REST/V1/Routes/Walking?wp.0=${startPoint}&wp.1=${endPoint}&key=${apiKey}&routeAttributes=routePath`)
      .then(response => response.json())
      .then(data => {
        setRoute(data.resourceSets[0].resources[0]);
      })
      .catch(error => setError(error));
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!route) {
    return <div>Loading...</div>;
  } else {
    return (
      <div>
        Done!
      </div>
    );
  }
}

export default RouteInfo;
