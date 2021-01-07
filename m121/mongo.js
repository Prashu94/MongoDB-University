var pipeline = [
{$match: 
	{$and: [
		{"imdb.rating": {$gte: 7}},
		{"genres": {$not: {$in: ["Crime", "Horror"]}}},
		{"rated": {$in: ["PG", "G"]}},
		{"languages": {$all: ["English", "Japanese"]}}
	]}}, 
{$project: {_id: 0, title: 1, rated: 1}}]

var pipeline = [
	{$match: {"title": {$type: "string"}}},
	{$project: {_id: 0, "title_size": {$split: ["$title", " "]}}},
	{$match: {"title_size": {$size: 1}}}
]

var pipeline = [
{$match: {
	"cast": {$elemMatch: {$exists: true}}, 
	"directors": {$elemMatch: {$exists: true}},
	"writers": {$elemMatch: {$exists: true}}}},
{$project: {
	_id: 0, cast: 1, directors: 1, 
	writers: {$map: 
				{input: "$writers", 
				 as: "writer", 
				 in: {$arrayElemAt: [{$split: [ "$$writer", " (" ]}, 0]}}}
}},
{$project: {"labor_of_love": 
			{$gt: [{$size: {$setIntersection: ["$cast", "$directors", "$writers"]}}, 0]}}},
{$match: {labor_of_love: true}}
]

var favorites = [
  "Sandra Bullock",
  "Tom Hanks",
  "Julia Roberts",
  "Kevin Spacey",
  "George Clooney"]

var utility_pipeline = [
	{ $match: {
		"countries": { $in: ["USA"] }, 
		"tomatoes.viewer.rating": { $gte: 3 }, 
		"cast": { $in: favorites } 
		} 
	}, 
	{ $project: {
		_id: 0, "title": 1, "cast": 1, "countries": 1, 
		"tomatoes.viewer.rating": 1,
		"num_favs": { 
			$size: {
				$setIntersection: [ "$cast", favorites ] } 
			} 
		}
	},
	{ $sort: { "num_favs": -1, 
			   "tomatoes.viewer.rating": -1, 
			   "title": -1 }
	},
	{ $skip: 24 }, 
	{ $limit: 1 }
]


var accumulator_pipeline = [
  { $match: 
    { 
	  "languages": { $in: ["English"] }, 
	  "imdb.rating": { $gte: 1 }, 
	  "imdb.votes": { $gte: 1 }, 
	  "released" : { $gte: ISODate("1990-01-01") }
    } 
  }, 
  { $project: 
  	{ _id: 0, "imdb.votes": 1, "title": 1, 
  	  "scale_voting": {
		$add: [ 
		  1, { $multiply: [
			9, { $divide: [
			  { $subtract: ["$imdb.votes", x_min] },
			  { $subtract: [x_max, x_min] } 
			] }
		  ] }
		] },
  	  "vote_avg": { $avg: ["scale_voting", "$imdb.rating"] } 
	} 
  }, 
  { $sort: {"vote_avg": 1} }, 
  { $limit: 1 }
]


var pipeline = [
  { $project: 
  	{ 
	  "imdb.rating": 1,
	  "Oscar": { $regexFindAll: 
	  	{ input: "$awards", regex: /Won.*Oscar/, options: 'si' } } 
  	} 
  },
  { $match: 
  	{
	  "Oscar": { $elemMatch: { $exists: true } } 
	} 
  },
  { $group: 
    {
	  _id: null,
	  vote_max: { $max: "$imdb.rating" },
	  vote_min: { $min: "$imdb.rating" },
	  vote_avg: { $avg: "$imdb.rating" },
	  vote_std: { $stdDevSamp: "$imdb.rating" }
	}
  }
]


var group_pipeline = [
  { $match: 
    { 
	  "awards": /Won.*Oscar/ 
	}
  },
  { $group: 
    {
	  _id: null,
	  vote_max: { $max: "$imdb.rating" },
	  vote_min: { $min: "$imdb.rating" },
	  vote_avg: { $avg: "$imdb.rating" },
	  vote_std: { $stdDevSamp: "$imdb.rating" }
	}
  }
]


var unwind_pipeline = [
  { $match: { "languages": "English" } },
  { $project: { _id: 0, "cast": 1, "imdb.rating": 1 } }, 
  { $unwind: "$cast" },
  { $group:
    {
	  _id: "$cast",
	  numFilms: { $sum: 1 },
	  average: { $avg: "$imdb.rating" }
	}
  },
  { $sort: { "numFilms": -1 } },
  { $limit: 1 }
]


var pipeline = [
  { $lookup: 
    {
	  from: "air_routes",
	  foreignField: "airline.name",
	  localField: "airlines",
	  as: "routes"
    }
  },
  { $unwind: "$routes" },
  { $match:
    {
	  "routes.airplane": /747|380/
	}
  },
  { $group:
    {
	  _id: "$name",
	  count: { $sum: 1 }
	}
  }
]

var lookup_pipeline = [
  { $match: 
    {
	  "airplane": /747|380/
	}
  },
  { $lookup:
    { 
	  from: "air_alliances",
	  foreignField: "airlines",
	  localField: "airline.name",
	  as: "alliance"
	}
  },
  { $unwind: "$alliance" },
  { $group:
    { 
	  _id: "$alliance.name",
	  count: { $sum: 1 }
	}
  }
]


var pipeline = [
  { $match:
    {
	  "imdb.rating": { $ne: "" }, "metacritic": { $ne: null }
	}
  },
  { $facet: 
    {
	  "rating": 
	  [
		{ $sort: { "imdb.rating": -1 } },
		{ $limit: 10 },
		{ $project: { _id: 0, 'title': 1, "imdb.rating": 1 } },
	  ],
	  "meta":
	  [
		{ $sort: { "metacritic": -1 } },
		{ $limit: 10 },
		{ $project: { _id: 0, "title": 1, "imdb.rating": 1 } },
	  ]
	}
  },
  { $project:
    {
	  "rating": 1, "meta": 1,
	  "result": { $setIntersection: [ "$rating", "$meta" ] },
	}
  }
]


var pipeline = [
  { $match: 
    { "src_airport": "JFK", "dst_airport": "LHR" } 
  },
  { $lookup:
    {
	  from: "air_alliances",
	  foreignField: "airlines",
	  localField: "airline.name",
	  as: "alliance"
	}
  },
  { $project:
    { _id: 0, "alliance.name": 1 }
  },
  { $unwind: "$alliance" },
  { $group:
    { 
      _id: "$alliance.name",
	  count: { $sum: 1 }
	}
  }
]
