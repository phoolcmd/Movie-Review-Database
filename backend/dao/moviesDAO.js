import { query } from "express";

let movies;

export default class MoviesDAO {
    static async injectDC(conn){
        if(movies){
            return;
        }
    
        try {
        movies = await conn.db(process.env.MOVIEREVIEWS_NS).collections('movies');

        } catch (e) {
        console.error('unable to connect in Movies:DAO${e}');
        }
    }

    static async getMovies({//default search filter
    filters = null,
    page = 0,
    moviesPerPage = 20,
    } = {})
       
       {
        if(filters) {
            if(filters.hasOwnProperty('title')) {
                query = {$text: {$search: filters['title']}}
            }
            else if(filters.hasOwnProperty('rated')) {
                query = {"rated": filters['rated']}
            }
        }
        let cursor;
        try{
                cursor = await movies
                .find(query)
                .limit(moviesPerPage)
                .skip(moviesPerPage * page);
            const moviesList = await cursor.toArray();
            const totalNumMovies = await movies.countDocuments(query)
            return {moviesList, totalNumMovies}
        } catch(e) {
            console.error('Unable to issue find command, $ {e}');
            return { moviesList: [], totalNumMovies: 0};
        }


       }
}

