// Database Models
var { Model, DbQuery } = require('./ZeroQuery/db.js');
class Story extends Model {
    static get tableName() { return "stories"; }

    constructor() {
        // Note: You can leave off columns if you don't
        // want them stored in the model.
        super([
            "story_id",
            "title",
            "slug",
            "description",
            "body",
            "tags",
            "language",
            "date_updated",
            "date_added",
            // LEFT JOIN json
            "directory",
            "cert_user_id",
            "json_id",
            // LEFT JOIN keyvalue
            "value"
        ]);
    }

    static get(auth_address, slug) {
        return Story.select("story_id", "title", "slug", "description", "body", "tags", "language", "date_updated", "date_added", "value")
            .leftJoinJson().leftJoinUsing("keyvalue", "json_id")
            .where("directory", "users/" + auth_address)
            .andWhere("slug", slug).andWhere("key", "name")
            .log("<Story: get> ").get(page);
    }

    static getFromId(auth_address, story_id) {
        return Story.select("story_id", "title", "slug", "description", "body", "tags", "language", "date_updated", "date_added", "value")
            .leftJoinJson().leftJoinUsing("keyvalue", "json_id")
            .where("directory", "users/" + auth_address)
            .andWhere("story_id", id).andWhere("key", "name")
            .log("<Story: getFromId> ").get(page);
    }

    static getMinimal(auth_address, story_id) {
        return Story.select("story_id", "title", "slug", "language", "directory", "value")
            .leftJoinJson().leftJoinUsing("keyvalue", "json_id")
            .where("directory", "users/" + auth_address)
            .andWhere("story_id", story_id).andWhere("key", "name")
            .log("<Story: getMinimal> ").get(page);
    }

    static getAllFromTag(tagSlug) {
        return Story.all().leftJoinJson().leftJoinUsing("keyvalue", "json_id")
            .where("REPLACE(tags, \" \", \"-\")", "LIKE", "%" + tagSlug + "%")
            .andWhere("key", "name")
            .orderBy("date_added", "DESC")
            .log("<Story: getFromTag> ").get(page);
    }
}

class Response extends Model {
    static get tableName() { return "responses"; }

    constructor() {
        super([
            "response_id",
            "body",
            "reference_id",
            "reference_auth_address",
            "reference_type",
            "date_updated",
            "date_added",
            // LEFT JOIN json
            "directory",
            "cert_user_id",
            "json_id",
            // LEFT JOIN keyvalue
            "value"
        ]);
    }

    static get(auth_address, response_id) {
        return Response.all().leftJoinJson().leftJoinUsing("keyvalue", "json_id")
            .where("directory", "users/" + auth_address)
            .andWhere("response_id", response_id)
            .andWhere("key", "name").limit(1)
            .log("<Response: get> ").get(page);
    }

    // static getWithStory() {}

    static getAllFromStory(reference_auth_address, reference_id, reference_type) {
        return Response.all().leftJoinJson().leftJoinUsing("keyvalue", "json_id")
            .where("reference_auth_address", reference_auth_address)
            .andWhere("reference_id", reference_id).andWhere("reference_type", reference_type)
            .andWhere("key", "name").orderBy("date_added", "DESC")
            .log("<Response: getFromStory> ").get(page);
    }
}

module.exports = { Model, DbQuery, Story, Response };