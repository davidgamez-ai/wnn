import csvParser from "csv-parser";
import fs from "fs";

// Debugs
const DEBUG_RATINGS:boolean = false;
const DEBUG_MOVIES:boolean = false;
const DEBUG_TAGS:boolean = false;

//MovieLens file details
const movieLensFolder:string = "C:/Data/MovieLens/ml-latest-small";
const ratingsFilename:string = "ratings.csv";
const movieLensMoviesFileName:string = "movies.csv"

//Letterboxd file details
const letterboxdFolder:string = "C:/Data/Letterboxd";
const letterboxdMoviesFilename:string = "movies.csv";
const letterboxdGenresFilename:string = "genres.csv";
const letterboxdStudiosFilename:string = "studios.csv";
const letterboxdLanguagesFilename:string = "languages.csv";
const letterboxdActorsFilename:string = "actors.csv";

//Structure of ratings
interface RawRating {
    userId:number,
    movieId:number,
    rating:number,
    timestamp:number
}

//Data type for a user rating of a movie.
interface Rating {
    movieTitle:string,
    movieLensId:number,
    letterboxdId:number|undefined,
    rating:number,
    timestamp:number
}

//Data type linking all users with their ratings.
//Key is the user ID. Value is an array of ratings.
interface UserRating {
    [key: string] : Rating[]
}

//Holds the user ratings
const userRatings:UserRating = {}

//Corresponds to MovieLens movie.csv
interface MovieLensMovie {
    movieId:number,
    title:string,
    genres:string
}

// Relationship between MovieLens Movie ID and film title (date) and genre tags
interface MovieLensMovies {
    [key: number] : {
        title:string,
        tags: Tags
    }
}

//Holds relationship between MovieLens ID and film title.
let movieLensMovies:MovieLensMovies = {};

//Corresponds to Letterboxd movies.csv
interface LetterboxdMovie {
    id:number,
    name:string,
    date:string
}

interface LetterboxdMovies {
    [key:string]: number
}

interface Tags {
    [key:string]: boolean
}

// Holds relationship between movie name, for example Barbie (2023),
// and letterboxd id.
let letterboxdMovies:LetterboxdMovies|undefined = {};

//Corresponds to Letterboxd genres.csv
interface LetterboxdGenre {
    id:number,
    genre:string,
}
//Corresponds to Letterboxd studios.csv
interface LetterboxdStudio {
    id:number,
    studio:string,
}
//Corresponds to Letterboxd languages.csv
interface LetterboxdLanguage {
    id:number,
    type:string,
    language:string
}
//Corresponds to Letterboxd actors.csv
interface LetterboxdActor {
    id:number,
    name:string,
    role:string
}

/** Key is the Letterboxd movie id.
 *  Value is an object containing tags for that movie.
 *  Object used to enable simple filtering of duplicates.
 */
interface LetterboxdTags {
    [key:string]:Tags
}
const letterboxdTags:LetterboxdTags  = {};

function readMovieLensMovies():void {
    console.log("Reading movie names from MovieLens data ...");
    fs.createReadStream(movieLensFolder + "/" + movieLensMoviesFileName)
        .pipe(csvParser())
        .on('data', (data:MovieLensMovie) => {
            //Extract the genre tags.
            const tags = getTagsFromGenreList(data.genres);

            //Store object for this film.
            movieLensMovies[data.movieId] = {
                title: data.title,
                tags: tags
            }
        })
        .on('end', () => {
            console.log("Movie names read from MovieLens");
            if(DEBUG_MOVIES) console.log(movieLensMovies);

            //Next read ratings and swap the ids for the name
            readRatings();
        });
}


/** Reads the MovieLens user ratings, swapping the Movie Id for the title 
 *  for cross referencing with Letterboxd
 */
function readRatings():void {
    console.log("Reading user ratings features...");
    fs.createReadStream(movieLensFolder + "/" + ratingsFilename)
        .pipe(csvParser())
        .on('data', (data:RawRating) => {
            //Store in array
            //Create array if it does not exist
            if(!userRatings[data.userId]){
                userRatings[data.userId] = [];
            }

            //Convert ID to title
            const movieTitle = movieLensMovies[data.movieId].title;
            if(!movieTitle)
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
            for(let userId in userRatings){
                userRatings[userId].sort((rating1:Rating, rating2:Rating)=>{
                    if(rating1.timestamp < rating2.timestamp)
                        return -1;
                    if(rating1.timestamp > rating2.timestamp)
                        return 1;
                    return 0;
                });
            }

            //Read in titles and IDs of movies from Letterboxd data
            readLetterboxdMovies();
        });
}

function readLetterboxdMovies():void {
    console.log("Reading Letterboxd movie data ...");
    fs.createReadStream(letterboxdFolder + "/" + letterboxdMoviesFilename)
        .pipe(csvParser())
        .on('data', (data:LetterboxdMovie) => {
            if(!letterboxdMovies)
                throw "letterboxdMovies is undefined";
            letterboxdMovies[`${data.name} (${data.date})`] = data.id;
        })
        .on('end', () => {
            console.log("Letterboxd IDs read.");

            //Work through user ratings to find ID of movies
            let notFoundCount:number = 0, foundCount:number = 0;;
            for(let userId in userRatings){
                const ratingArray:Rating[] = userRatings[userId];
                for(let rating of ratingArray){
                    if(letterboxdMovies && letterboxdMovies[rating.movieTitle]){
                        rating.letterboxdId = letterboxdMovies[rating.movieTitle];
                        ++foundCount
                    }
                    else{
                        ++notFoundCount;
                    }
                }
            }
            //Output results
            console.log(`${notFoundCount + foundCount} Letterboxd Ids processed. Number of movies not found: ${notFoundCount}`);
            if(DEBUG_RATINGS) console.log(userRatings);

            //Clean up memory
            letterboxdMovies = undefined;

            //Read genres
            readGenres();
        });
}


/** Reads the genres for each movie */
function readGenres():void {
    console.log("Reading Letterboxd genre data ...");
    fs.createReadStream(letterboxdFolder + "/" + letterboxdGenresFilename)
        .pipe(csvParser())
        .on('data', (data:LetterboxdGenre) => {
            if(!letterboxdTags[data.id])
                letterboxdTags[data.id] = {};
            letterboxdTags[data.id][data.genre]  = true;
        })
        .on('end', () => {
            console.log("Letterboxd genre data read.");
            
            //Read studios
            readStudios();
        })
}

/** Reads the studios for each movie */
function readStudios():void {
    console.log("Reading Letterboxd studio data ...");
    fs.createReadStream(letterboxdFolder + "/" + letterboxdStudiosFilename)
        .pipe(csvParser())
        .on('data', (data:LetterboxdStudio) => {
            if(!letterboxdTags[data.id])
                letterboxdTags[data.id] = {};
            letterboxdTags[data.id][data.studio]  = true;
        })
        .on('end', () => {
            console.log("Letterboxd studio data read.");
           
            //Read languages
            readLanguages()
        })
}

/** Reads the primary language for each movie */
function readLanguages():void {
    console.log("Reading Letterboxd language data ...");
    fs.createReadStream(letterboxdFolder + "/" + letterboxdLanguagesFilename)
        .pipe(csvParser())
        .on('data', (data:LetterboxdLanguage) => {
            if(!letterboxdTags[data.id])
                letterboxdTags[data.id] = {};

            //Only store primary language for the moment
            if(data.type === "Primary language" || data.type === "Language")
                letterboxdTags[data.id][data.language]  = true;
        })
        .on('end', () => {
            console.log("Letterboxd language data read.");
            
            //Read actor data
            readActors();
        })
}

/** Reads the actor for each movie */
function readActors():void {
    console.log("Reading Letterboxd actor data ...");
    fs.createReadStream(letterboxdFolder + "/" + letterboxdActorsFilename)
        .pipe(csvParser())
        .on('data', (data:LetterboxdActor) => {
            if(!letterboxdTags[data.id])
                letterboxdTags[data.id] = {};
            letterboxdTags[data.id][data.name]  = true;
        })
        .on('end', () => {
            console.log("Letterboxd actor data read.");
            if(DEBUG_TAGS) console.log(letterboxdTags);

            processRatings();
        })
}


/**
 * Extracts genre tags from MovieLens data.
 * 
 * @param genreList for example: Adventure|Animation|Children|Comedy|Fantasy
 * @returns 
 */
function getTagsFromGenreList(genreList:string):Tags{
    const tags:Tags = {};
    const genreArray = genreList.split('|');
    for(let genre of genreArray){
        tags[genre] = true;
    }
    return tags;
}


function processRatings(){
    //Work through users.
    for(let userId in userRatings){
        // console.log("Processing " + userId);

        //Get complete set of tags for this user
        //This will be used to generate the input space for the network
        //Tags will already have been filtered for duplicates
        const tagArray:string[] = [];

        //Work through user ratings
        for(let rating of userRatings[userId]){
            //User Letterboxd tags if they exist
            if(rating.letterboxdId){
                //Add letterboxd tags to tag array
                for(let tag in letterboxdTags[rating.letterboxdId]){
                    tagArray.push(tag);
                }
            }
            //Letterboxd does not have movie data, use MovieLens genres instead
            else if(rating.movieLensId){
                for(let tag in movieLensMovies[rating.movieLensId].tags){
                    tagArray.push(tag);
                }
            } 
            else{
                throw "Movie data for rating not found";
            }
        }

        if(parseInt(userId) % 50 === 0){
            console.log("User: " + userId);
            console.log(tagArray);
        } 

        //Convert to nice JSON file. Similar to Letters
        //Do your experiments
        //https://plotly.com/nodejs/
    }
}

//Starting point for chain of reads
readMovieLensMovies();

