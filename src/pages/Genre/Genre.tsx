import { useEffect, useState } from 'react';
import type { Genre } from '../../api/genres';
import { getGenres } from '../../api/genres';

import GenreForm from './GenreForm';

export function Genre() {
    const [genres, setGenres] = useState<Genre[]>([]);

    const fetchGenres = async () => {
        const res = await getGenres();
        setGenres(res.data.data);
    };

    useEffect(() => {
        getGenres().then(res => {
        setGenres(res.data.data); // because of pagination
        });
    }, []);

    return (
        <div>
            <h1>Genres</h1>
            {genres.map(g => (
                <div key={g.id}>
                    {g.name}
                </div>
            ))}

             <GenreForm onCreated={fetchGenres} />
        </div>
    );
}