import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const SearchResults = () => {
    const [results, setResults] = useState([]);
    const location = useLocation();
    const query = new URLSearchParams(location.search).get('q');

    useEffect(() => {
        if (query) {
            fetch(`http://localhost:4000/search?q=${query}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) setResults(data.products);
                })
                .catch(err => console.error(err));
        }
    }, [query]);

    return (
        <div>
            <h1>Search Results</h1>
            {results.length > 0 ? (
                results.map(product => (
                    <div key={product.id}>
                        <h2>{product.name}</h2>
                        {/* Add more product details as needed */}
                    </div>
                ))
            ) : (
                <p>No results found.</p>
            )}
        </div>
    );
};

export default SearchResults;