import csvParser from "csv-parser";
import fs from "fs";
import { saveMovieLens } from './File.js';
// Debugs
const DEBUG_RATINGS = false;
const DEBUG_MOVIES = false;
const DEBUG_TAGS = false;
//MovieLens file details
const movieLensFolder = "C:/Data/MovieLens/ml-latest-small";
const ratingsFilename = "ratings.csv";
const movieLensMoviesFileName = "movies.csv";
//Letterboxd file details
const letterboxdFolder = "C:/Data/Letterboxd";
const letterboxdMoviesFilename = "movies.csv";
const letterboxdGenresFilename = "genres.csv";
const letterboxdStudiosFilename = "studios.csv";
const letterboxdLanguagesFilename = "languages.csv";
const letterboxdActorsFilename = "actors.csv";
//Holds the user ratings
const userRatings = {};
//Holds relationship between MovieLens ID and film title.
let movieLensMovies = {};
// Holds relationship between movie name, for example Barbie (2023),
// and letterboxd id.
let letterboxdMovies = {};
const letterboxdTags = {};
const outputData = {};
function readMovieLensMovies() {
    console.log("Reading movie names from MovieLens data ...");
    fs.createReadStream(movieLensFolder + "/" + movieLensMoviesFileName)
        .pipe(csvParser())
        .on('data', (data) => {
        //Extract the genre tags.
        const tags = getTagsFromGenreList(data.genres);
        //Store object for this film.
        movieLensMovies[data.movieId] = {
            title: data.title,
            tags: tags
        };
    })
        .on('end', () => {
        console.log("Movie names read from MovieLens");
        if (DEBUG_MOVIES)
            console.log(movieLensMovies);
        //Next read ratings and swap the ids for the name
        readRatings();
    });
}
/** Reads the MovieLens user ratings, swapping the Movie Id for the title
 *  for cross referencing with Letterboxd
 */
function readRatings() {
    console.log("Reading user ratings features...");
    fs.createReadStream(movieLensFolder + "/" + ratingsFilename)
        .pipe(csvParser())
        .on('data', (data) => {
        //Store in array
        //Create array if it does not exist
        if (!userRatings[data.userId]) {
            userRatings[data.userId] = [];
        }
        //Convert ID to title
        const movieTitle = movieLensMovies[data.movieId].title;
        if (!movieTitle)
            throw "Movie title not found!";
        //Add data to userRatings object
        userRatings[data.userId].push({
            movieTitle: movieTitle,
            movieLensId: data.movieId,
            letterboxdId: undefined,
            rating: data.rating,
            timestamp: data.timestamp
        });
    })
        .on('end', () => {
        console.log("Ratings parsing complete");
        //Sort ratings by timestamp
        for (let userId in userRatings) {
            userRatings[userId].sort((rating1, rating2) => {
                if (rating1.timestamp < rating2.timestamp)
                    return -1;
                if (rating1.timestamp > rating2.timestamp)
                    return 1;
                return 0;
            });
        }
        //Read in titles and IDs of movies from Letterboxd data
        readLetterboxdMovies();
    });
}
function readLetterboxdMovies() {
    console.log("Reading Letterboxd movie data ...");
    fs.createReadStream(letterboxdFolder + "/" + letterboxdMoviesFilename)
        .pipe(csvParser())
        .on('data', (data) => {
        if (!letterboxdMovies)
            throw "letterboxdMovies is undefined";
        letterboxdMovies[`${data.name} (${data.date})`] = data.id;
    })
        .on('end', () => {
        console.log("Letterboxd IDs read.");
        //Work through user ratings to find ID of movies
        let notFoundCount = 0, foundCount = 0;
        ;
        for (let userId in userRatings) {
            const ratingArray = userRatings[userId];
            for (let rating of ratingArray) {
                if (letterboxdMovies && letterboxdMovies[rating.movieTitle]) {
                    rating.letterboxdId = letterboxdMovies[rating.movieTitle];
                    ++foundCount;
                }
                else {
                    ++notFoundCount;
                }
            }
        }
        //Output results
        console.log(`${notFoundCount + foundCount} Letterboxd Ids processed. Number of movies not found: ${notFoundCount}`);
        if (DEBUG_RATINGS)
            console.log(userRatings);
        //Clean up memory
        letterboxdMovies = undefined;
        //Read genres
        readGenres();
    });
}
/** Reads the genres for each movie */
function readGenres() {
    console.log("Reading Letterboxd genre data ...");
    fs.createReadStream(letterboxdFolder + "/" + letterboxdGenresFilename)
        .pipe(csvParser())
        .on('data', (data) => {
        if (!letterboxdTags[data.id])
            letterboxdTags[data.id] = {};
        letterboxdTags[data.id][data.genre] = true;
    })
        .on('end', () => {
        console.log("Letterboxd genre data read.");
        //Read studios
        readStudios();
    });
}
/** Reads the studios for each movie */
function readStudios() {
    console.log("Reading Letterboxd studio data ...");
    fs.createReadStream(letterboxdFolder + "/" + letterboxdStudiosFilename)
        .pipe(csvParser())
        .on('data', (data) => {
        if (!letterboxdTags[data.id])
            letterboxdTags[data.id] = {};
        letterboxdTags[data.id][data.studio] = true;
    })
        .on('end', () => {
        console.log("Letterboxd studio data read.");
        //Read languages
        readLanguages();
    });
}
/** Reads the primary language for each movie */
function readLanguages() {
    console.log("Reading Letterboxd language data ...");
    fs.createReadStream(letterboxdFolder + "/" + letterboxdLanguagesFilename)
        .pipe(csvParser())
        .on('data', (data) => {
        if (!letterboxdTags[data.id])
            letterboxdTags[data.id] = {};
        //Only store primary language for the moment
        if (data.type === "Primary language" || data.type === "Language")
            letterboxdTags[data.id][data.language] = true;
    })
        .on('end', () => {
        console.log("Letterboxd language data read.");
        //Read actor data
        // readActors();
        processRatings();
    });
}
/** Reads the actor for each movie */
function readActors() {
    console.log("Reading Letterboxd actor data ...");
    fs.createReadStream(letterboxdFolder + "/" + letterboxdActorsFilename)
        .pipe(csvParser())
        .on('data', (data) => {
        if (!letterboxdTags[data.id])
            letterboxdTags[data.id] = {};
        letterboxdTags[data.id][data.name] = true;
    })
        .on('end', () => {
        console.log("Letterboxd actor data read.");
        if (DEBUG_TAGS)
            console.log(letterboxdTags);
        processRatings();
    });
}
/**
 * Extracts genre tags from MovieLens data.
 *
 * @param genreList for example: Adventure|Animation|Children|Comedy|Fantasy
 * @returns
 */
function getTagsFromGenreList(genreList) {
    const tags = {};
    const genreArray = genreList.split('|');
    for (let genre of genreArray) {
        tags[genre] = true;
    }
    return tags;
}
async function processRatings() {
    //Work through users.
    for (let userId in userRatings) {
        //Initialize data structure for this user
        outputData[parseInt(userId)] = {};
        outputData[parseInt(userId)].ratings = [];
        //Get complete set of tags for this user
        //This will be used to generate the input space for the network
        //Tags will already have been filtered for duplicates for each movie.
        //Need to eliminate duplicates between movies.
        const completeUserTags = {};
        //Work through user ratings
        for (let rating of userRatings[userId]) {
            //Set of tags for the movie in this rating
            const ratedMovieTags = [];
            //Get complete set of tags for input space
            //User Letterboxd tags if they exist
            if (rating.letterboxdId) {
                //Add letterboxd tags to tag object
                for (let tag in letterboxdTags[rating.letterboxdId]) {
                    //Add to complete tag list for input space calculation
                    completeUserTags[clean(tag)] = true;
                    //Store tags for just this movie.
                    ratedMovieTags.push(clean(tag));
                }
            }
            //Letterboxd does not have movie data, use MovieLens genres instead
            else if (rating.movieLensId) {
                for (let tag in movieLensMovies[rating.movieLensId].tags) {
                    //Add to complete tag list for input space calculation
                    completeUserTags[clean(tag)] = true;
                    //Store tags for just this movie
                    ratedMovieTags.push(clean(tag));
                }
            }
            else {
                throw "Movie data for rating not found";
            }
            //Store the rating, timestamp and tags for this movie
            outputData[parseInt(userId)].ratings?.push({
                rating: rating.rating,
                timestamp: rating.timestamp,
                tags: ratedMovieTags
            });
        }
        //Add the complete set of tags as an array
        const completeTags = [];
        for (let tag in completeUserTags) {
            completeTags.push(tag);
        }
        outputData[parseInt(userId)].completeTags = completeTags;
    }
    //Save the data to a file
    await saveMovieLens(outputData, "../src/data/MovieLens.js");
    await saveMovieLens(outputData, "../js/data/MovieLens.js");
}
/** Removes quotations and any other characters that interfere with JSON parse.
 *  Will not affect learning as long as tag names are unique.
 */
function clean(str) {
    return str.replaceAll(/\'|\"/g, "");
}
//Starting point for chain of reads
readMovieLensMovies();
