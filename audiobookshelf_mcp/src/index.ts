#!/usr/bin/env node
/**
 * MCP Server generated from OpenAPI spec for audiobookshelf-api v0.1.0
 * Generated on: 2025-09-13T14:23:41.880Z
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
  type CallToolResult,
  type CallToolRequest
} from "@modelcontextprotocol/sdk/types.js";
import { setupStreamableHttpServer } from "./streamable-http.js";

import { z, ZodError } from 'zod';
import { jsonSchemaToZod } from 'json-schema-to-zod';
import axios, { type AxiosRequestConfig, type AxiosError } from 'axios';

/**
 * Type definition for JSON objects
 */
type JsonObject = Record<string, any>;

/**
 * Interface for MCP Tool Definition
 */
interface McpToolDefinition {
    name: string;
    description: string;
    inputSchema: any;
    method: string;
    pathTemplate: string;
    executionParameters: { name: string, in: string }[];
    requestBodyContentType?: string;
    securityRequirements: any[];
}

/**
 * Server configuration
 */
export const SERVER_NAME = "audiobookshelf-api";
export const SERVER_VERSION = "0.1.0";
export const API_BASE_URL = "http://localhost:3000";

/**
 * MCP Server instance
 */
const server = new Server(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { capabilities: { tools: {} } }
);

/**
 * Map of tool definitions by name
 */
const toolDefinitionMap: Map<string, McpToolDefinition> = new Map([

  ["getAuthorById", {
    name: "getAuthorById",
    description: `Get an author by ID. The author's books and series can be included in the response.`,
    inputSchema: {"type":"object","properties":{"include":{"type":"string","description":"A comma separated list of what to include with the author. The options are `items` and `series`. `series` will only have an effect if `items` is included. For example, the value `items,series` will include both library items and series."}}},
    method: "get",
    pathTemplate: "/api/authors/{id}",
    executionParameters: [{"name":"include","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["deleteAuthorById", {
    name: "deleteAuthorById",
    description: `Delete an author by ID. This will remove the author from all books.`,
    inputSchema: {"type":"object","properties":{}},
    method: "delete",
    pathTemplate: "/api/authors/{id}",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["updateAuthorById", {
    name: "updateAuthorById",
    description: `Update an author by ID. The author's name and description can be updated. This endpoint will merge two authors if the new author name matches another author name in the database.`,
    inputSchema: {"type":"object","properties":{"requestBody":{"properties":{"name":{"description":"The name of the author.","type":"string","example":"Terry Goodkind"},"description":{"description":"The new description of the author.","type":"string","nullable":true,"example":"Terry Goodkind is a"},"imagePath":{"description":"The absolute path for the author image. This will be in the `metadata/` directory. Will be null if there is no image.","type":"string","nullable":true,"example":"/metadata/authors/aut_z3leimgybl7uf3y4ab.jpg"},"asin":{"description":"The Audible identifier (ASIN) of the author. Will be null if unknown. Not the Amazon identifier.","type":"string","nullable":true,"example":"B000APZOQA"}},"description":"The author object to update."}}},
    method: "patch",
    pathTemplate: "/api/authors/{id}",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["getAuthorImageById", {
    name: "getAuthorImageById",
    description: `Get an author image by author ID. The image will be returned in the requested format and size.`,
    inputSchema: {"type":"object","properties":{"requestBody":{"properties":{"width":{"description":"The requested width of image in pixels.","type":"integer","default":400,"example":400},"height":{"description":"The requested height of image in pixels. If `null`, the height is scaled to maintain aspect ratio based on the requested width.","type":"integer","nullable":true,"default":null,"example":600},"format":{"description":"The requested output format.","type":"string","default":"jpeg","example":"webp"},"raw":{"description":"Return the raw image without scaling if true.","type":"boolean","default":false}},"description":"The author image to get."}}},
    method: "get",
    pathTemplate: "/api/authors/{id}/image",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: []
  }],
  ["addAuthorImageById", {
    name: "addAuthorImageById",
    description: `Add an author image to the server. The image will be downloaded from the provided URL and stored on the server.`,
    inputSchema: {"type":"object","properties":{"requestBody":{"description":"The author image to add by URL.","type":"string","format":"uri"}},"required":["requestBody"]},
    method: "post",
    pathTemplate: "/api/authors/{id}/image",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["deleteAuthorImageById", {
    name: "deleteAuthorImageById",
    description: `Delete an author image by author ID. This will remove the image from the server and the database.`,
    inputSchema: {"type":"object","properties":{}},
    method: "delete",
    pathTemplate: "/api/authors/{id}/image",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["updateAuthorImageById", {
    name: "updateAuthorImageById",
    description: `Update an author image by author ID. The image will be resized if the width, height, or format is provided.`,
    inputSchema: {"type":"object","properties":{"requestBody":{"properties":{"width":{"description":"The requested width of image in pixels.","type":"integer","default":400,"example":400},"height":{"description":"The requested height of image in pixels. If `null`, the height is scaled to maintain aspect ratio based on the requested width.","type":"integer","nullable":true,"default":null,"example":600},"format":{"description":"The requested output format.","type":"string","default":"jpeg","example":"webp"},"raw":{"description":"Return the raw image without scaling if true.","type":"boolean","default":false}},"description":"The author image to update."}}},
    method: "patch",
    pathTemplate: "/api/authors/{id}/image",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["matchAuthorById", {
    name: "matchAuthorById",
    description: `Match the author against Audible using quick match. Quick match updates the author's description and image (if no image already existed) with information from audible. Either \`asin\` or \`q\` must be provided, with \`asin\` taking priority if both are provided.`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"q":{"description":"The name of the author to use for searching.","type":"string"},"asin":{"description":"The Audible identifier (ASIN) of the author. Will be null if unknown. Not the Amazon identifier.","type":["string","null"]},"region":{"description":"The region used to search.","type":"string","default":"us"}},"description":"The author object to match against an online provider."}},"required":["requestBody"]},
    method: "post",
    pathTemplate: "/api/authors/{id}/match",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["getEmailSettings", {
    name: "getEmailSettings",
    description: `Get email settings for sending e-books to e-readers.`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/emails/settings",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["updateEmailSettings", {
    name: "updateEmailSettings",
    description: `Update email settings`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","description":"The email settings configuration for the server. This includes the credentials to send e-books and an array of e-reader devices.","properties":{"id":{"type":"string","description":"The unique identifier for the email settings. Currently this is always `email-settings`"},"host":{"type":["string","null"],"description":"The SMTP host address."},"port":{"type":"number","format":"int32","description":"The port number for the SMTP server."},"secure":{"type":"boolean","description":"Indicates if the connection should use SSL/TLS."},"rejectUnauthorized":{"type":"boolean","description":"Indicates if unauthorized SSL/TLS certificates should be rejected."},"user":{"type":["string","null"],"description":"The username for SMTP authentication."},"pass":{"type":["string","null"],"description":"The password for SMTP authentication."},"testAddress":{"type":["string","null"],"description":"The test email address used for sending test emails."},"fromAddress":{"type":["string","null"],"description":"The default \"from\" email address for outgoing emails."},"ereaderDevices":{"type":"array","description":"List of configured e-reader devices.","items":{"type":"object","description":"An e-reader device configured to receive EPUB through e-mail.","properties":{"name":{"type":"string","description":"The name of the e-reader device."},"email":{"type":"string","description":"The email address associated with the e-reader device."},"availabilityOption":{"type":"string","description":"The availability option for the device.","enum":["adminOrUp","userOrUp","guestOrUp","specificUsers"]},"users":{"type":"array","description":"List of specific users allowed to access the device.","items":{"type":"string"}}},"required":["name","email","availabilityOption"]}}},"required":["id","port","secure","ereaderDevices"]}},"required":["requestBody"]},
    method: "patch",
    pathTemplate: "/api/emails/settings",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["sendTestEmail", {
    name: "sendTestEmail",
    description: `Send test email`,
    inputSchema: {"type":"object","properties":{}},
    method: "post",
    pathTemplate: "/api/emails/test",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["updateEReaderDevices", {
    name: "updateEReaderDevices",
    description: `Update e-reader devices`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"ereaderDevices":{"type":"array","items":{"type":"object","description":"An e-reader device configured to receive EPUB through e-mail.","properties":{"name":{"type":"string","description":"The name of the e-reader device."},"email":{"type":"string","description":"The email address associated with the e-reader device."},"availabilityOption":{"type":"string","description":"The availability option for the device.","enum":["adminOrUp","userOrUp","guestOrUp","specificUsers"]},"users":{"type":"array","description":"List of specific users allowed to access the device.","items":{"type":"string"}}},"required":["name","email","availabilityOption"]}}},"description":"The JSON request body."}},"required":["requestBody"]},
    method: "post",
    pathTemplate: "/api/emails/ereader-devices",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["sendEBookToDevice", {
    name: "sendEBookToDevice",
    description: `Send ebook to device`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"libraryItemId":{"type":"string","description":"The ID of library items after 2.3.0.","format":"uuid"},"deviceName":{"type":"string","description":"The name of the e-reader device."}},"description":"The JSON request body."}},"required":["requestBody"]},
    method: "post",
    pathTemplate: "/api/emails/send-ebook-to-device",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["getLibraries", {
    name: "getLibraries",
    description: `Get all libraries on server.`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/libraries",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["createLibrary", {
    name: "createLibrary",
    description: `Create a new library on server.`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","required":["name","folders"],"properties":{"name":{"description":"The name of the library.","type":"string"},"folders":{"description":"The folders of the library. Only specify the fullPath.","type":"array","items":{"type":"object","description":"Folder used in library","properties":{"id":{"type":"string","description":"The ID of the folder.","format":"uuid"},"fullPath":{"description":"The path on the server for the folder. (Read Only)","type":"string"},"libraryId":{"type":"string","description":"The ID of the library.","format":"uuid"},"addedAt":{"type":"number","description":"The time (in ms since POSIX epoch) when added to the server."}}}},"displayOrder":{"description":"The display order of the library. Must be >= 1.","type":"number","minimum":1},"icon":{"description":"The icon of the library. See Library Icons for a list of possible icons.","type":"string"},"mediaType":{"description":"The type of media that the library contains. Must be `book` or `podcast`.","type":"string"},"provider":{"description":"Preferred metadata provider for the library. See Metadata Providers for a list of possible providers.","type":"string"},"settings":{"description":"The settings for the library.","type":"object","properties":{"coverAspectRatio":{"description":"Whether the library should use square book covers. Must be 0 (for false) or 1 (for true).","type":"number"},"disableWatcher":{"description":"Whether to disable the folder watcher for the library.","type":"boolean"},"skipMatchingMediaWithAsin":{"description":"Whether to skip matching books that already have an ASIN.","type":"boolean"},"skipMatchingMediaWithIsbn":{"description":"Whether to skip matching books that already have an ISBN.","type":"boolean"},"autoScanCronExpression":{"description":"The cron expression for when to automatically scan the library folders. If null, automatic scanning will be disabled.","type":["string","null"]},"audiobooksOnly":{"description":"Whether the library should ignore ebook files and only allow ebook files to be supplementary.","type":"boolean"},"hideSingleBookSeries":{"description":"Whether to hide series with only one book.","type":"boolean"},"onlyShowLaterBooksInContinueSeries":{"description":"Whether to only show books in a series after the highest series sequence.","type":"boolean"},"metadataPrecedence":{"description":"The precedence of metadata sources. See Metadata Providers for a list of possible providers.","type":"array","items":{"type":"string"}},"podcastSearchRegion":{"description":"The region to use when searching for podcasts.","type":"string"}}}},"description":"The library object to create."}}},
    method: "post",
    pathTemplate: "/api/libraries",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["getLibraryById", {
    name: "getLibraryById",
    description: `Get a single library by ID on server.`,
    inputSchema: {"type":"object","properties":{"include":{"type":"string"},"minified":{"type":"number","minimum":0,"description":"Return minified items if true"}}},
    method: "get",
    pathTemplate: "/api/libraries/{id}",
    executionParameters: [{"name":"include","in":"query"},{"name":"minified","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["deleteLibraryById", {
    name: "deleteLibraryById",
    description: `Delete a single library by ID on server and return the deleted object.`,
    inputSchema: {"type":"object","properties":{}},
    method: "delete",
    pathTemplate: "/api/libraries/{id}",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["updateLibraryById", {
    name: "updateLibraryById",
    description: `Update a single library by ID on server.`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"name":{"description":"The name of the library.","type":"string"},"folders":{"description":"The folders of the library. Only specify the fullPath.","type":"array","items":{"type":"object","description":"Folder used in library","properties":{"id":{"type":"string","description":"The ID of the folder.","format":"uuid"},"fullPath":{"description":"The path on the server for the folder. (Read Only)","type":"string"},"libraryId":{"type":"string","description":"The ID of the library.","format":"uuid"},"addedAt":{"type":"number","description":"The time (in ms since POSIX epoch) when added to the server."}}}},"displayOrder":{"description":"The display order of the library. Must be >= 1.","type":"number","minimum":1},"icon":{"description":"The icon of the library. See Library Icons for a list of possible icons.","type":"string"},"mediaType":{"description":"The type of media that the library contains. Must be `book` or `podcast`.","type":"string"},"provider":{"description":"Preferred metadata provider for the library. See Metadata Providers for a list of possible providers.","type":"string"},"settings":{"description":"The settings for the library.","type":"object","properties":{"coverAspectRatio":{"description":"Whether the library should use square book covers. Must be 0 (for false) or 1 (for true).","type":"number"},"disableWatcher":{"description":"Whether to disable the folder watcher for the library.","type":"boolean"},"skipMatchingMediaWithAsin":{"description":"Whether to skip matching books that already have an ASIN.","type":"boolean"},"skipMatchingMediaWithIsbn":{"description":"Whether to skip matching books that already have an ISBN.","type":"boolean"},"autoScanCronExpression":{"description":"The cron expression for when to automatically scan the library folders. If null, automatic scanning will be disabled.","type":["string","null"]},"audiobooksOnly":{"description":"Whether the library should ignore ebook files and only allow ebook files to be supplementary.","type":"boolean"},"hideSingleBookSeries":{"description":"Whether to hide series with only one book.","type":"boolean"},"onlyShowLaterBooksInContinueSeries":{"description":"Whether to only show books in a series after the highest series sequence.","type":"boolean"},"metadataPrecedence":{"description":"The precedence of metadata sources. See Metadata Providers for a list of possible providers.","type":"array","items":{"type":"string"}},"podcastSearchRegion":{"description":"The region to use when searching for podcasts.","type":"string"}}}},"description":"The library object to update."}},"required":["requestBody"]},
    method: "patch",
    pathTemplate: "/api/libraries/{id}",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["getLibraryAuthors", {
    name: "getLibraryAuthors",
    description: `Get all authors in a library by ID on server.`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/libraries/{id}/authors",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["getLibraryItems", {
    name: "getLibraryItems",
    description: `Get items in a library by ID on server.`,
    inputSchema: {"type":"object","properties":{"limit":{"type":"number","default":0,"description":"The number of items to return. This the size of a single page for the optional `page` query."},"page":{"type":"number","default":0,"description":"The page number (zero indexed) to return. If no limit is specified, then page will have no effect."},"sort":{"type":"string","default":"name","description":"The field to sort by from the request."},"desc":{"type":"number","default":0,"description":"Return items in reversed order if true."},"filter":{"type":"string","description":"The filter for the library."},"include":{"type":"string","description":"The fields to include in the response. The only current option is `rssfeed`."},"minified":{"type":"number","minimum":0,"description":"Return minified items if true"},"collapseSeries":{"type":"number","default":0,"description":"Whether to collapse series into a single cover"}}},
    method: "get",
    pathTemplate: "/api/libraries/{id}/items",
    executionParameters: [{"name":"limit","in":"query"},{"name":"page","in":"query"},{"name":"sort","in":"query"},{"name":"desc","in":"query"},{"name":"filter","in":"query"},{"name":"include","in":"query"},{"name":"minified","in":"query"},{"name":"collapseSeries","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["deleteLibraryIssues", {
    name: "deleteLibraryIssues",
    description: `Delete all items with issues in a library by library ID on the server. This only removes the items from the ABS database and does not delete media files.`,
    inputSchema: {"type":"object","properties":{}},
    method: "delete",
    pathTemplate: "/api/libraries/{id}/issues",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["getLibrarySeries", {
    name: "getLibrarySeries",
    description: `Get series in a library. Filtering and sorting can be applied.`,
    inputSchema: {"type":"object","properties":{"limit":{"type":"number","default":0,"description":"The number of items to return. This the size of a single page for the optional `page` query."},"page":{"type":"number","default":0,"description":"The page number (zero indexed) to return. If no limit is specified, then page will have no effect."},"sort":{"type":"string","enum":["name","numBooks","totalDuration","addedAt","lastBookAdded","lastBookUpdated"],"default":"name","description":"The field to sort by from the request."},"desc":{"type":"number","default":0,"description":"Return items in reversed order if true."},"filter":{"type":"string","description":"The filter for the library."},"include":{"type":"string","description":"The fields to include in the response. The only current option is `rssfeed`."},"minified":{"type":"number","minimum":0,"description":"Return minified items if true"}}},
    method: "get",
    pathTemplate: "/api/libraries/{id}/series",
    executionParameters: [{"name":"limit","in":"query"},{"name":"page","in":"query"},{"name":"sort","in":"query"},{"name":"desc","in":"query"},{"name":"filter","in":"query"},{"name":"include","in":"query"},{"name":"minified","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["getLibrarySeriesById", {
    name: "getLibrarySeriesById",
    description: `Get a single series in a library by ID on server. This endpoint is deprecated and \`/api/series/{id}\` should be used instead.`,
    inputSchema: {"type":"object","properties":{"limit":{"type":"number","default":0,"description":"The number of items to return. This the size of a single page for the optional `page` query."},"page":{"type":"number","default":0,"description":"The page number (zero indexed) to return. If no limit is specified, then page will have no effect."},"sort":{"type":"string","enum":["name","numBooks","totalDuration","addedAt","lastBookAdded","lastBookUpdated"],"default":"name","description":"The field to sort by from the request."},"desc":{"type":"number","default":0,"description":"Return items in reversed order if true."},"filter":{"type":"string","description":"The filter for the library."},"minified":{"type":"number","minimum":0,"description":"Return minified items if true"},"include":{"type":"string","description":"The fields to include in the response. The only current option is `rssfeed`."}}},
    method: "get",
    pathTemplate: "/api/libraries/{id}/series/{seriesId}",
    executionParameters: [{"name":"limit","in":"query"},{"name":"page","in":"query"},{"name":"sort","in":"query"},{"name":"desc","in":"query"},{"name":"filter","in":"query"},{"name":"minified","in":"query"},{"name":"include","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["getNotifications", {
    name: "getNotifications",
    description: `Get all Apprise notification events and notification settings for server.`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/notifications",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["createNotification", {
    name: "createNotification",
    description: `Create or update Notification settings.`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"libraryId":{"type":["string","null"],"description":"The ID of the library. Applies to all libraries if `null`.","format":"uuid"},"eventName":{"type":"string","description":"The name of the event the notification will fire on.","enum":["onPodcastEpisodeDownloaded","onBackupCompleted","onBackupFailed","onTest"]},"urls":{"type":"array","items":{"type":"string"},"description":"The Apprise URLs to use for the notification."},"titleTemplate":{"type":"string","description":"The template for the notification title."},"bodyTemplate":{"type":"string","description":"The template for the notification body."},"enabled":{"type":"boolean","default":false,"description":"Whether the notification is enabled."},"type":{"type":["string","null"],"enum":["info","success","warning","failure"],"default":"info","description":"The notification's type."}},"required":["eventName","urls","titleTemplate","bodyTemplate"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/api/notifications",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["configureNotificationSettings", {
    name: "configureNotificationSettings",
    description: `Update the URL, max failed attempts, and maximum notifications that can be queued for Apprise.`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"appriseApiUrl":{"type":["string","null"],"description":"The full URL where the Apprise API to use is located."},"maxFailedAttempts":{"type":"number","minimum":0,"default":5,"description":"The maximum number of times a notification fails before being disabled."},"maxNotificationQueue":{"type":"number","description":"The maximum number of notifications in the notification queue before events are ignored."}},"description":"The JSON request body."}}},
    method: "patch",
    pathTemplate: "/api/notifications",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["getNotificationEventData", {
    name: "getNotificationEventData",
    description: `Get all Apprise notification event data for the server.`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/notificationdata",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["sendDefaultTestNotification", {
    name: "sendDefaultTestNotification",
    description: `Send a test notification.`,
    inputSchema: {"type":"object","properties":{"fail":{"type":"number","description":"Whether to intentionally cause the notification to fail. `0` for false, `1` for true."}}},
    method: "get",
    pathTemplate: "/api/notifications/test",
    executionParameters: [{"name":"fail","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["deleteNotification", {
    name: "deleteNotification",
    description: `Delete the notification by ID and return the notification settings.`,
    inputSchema: {"type":"object","properties":{}},
    method: "delete",
    pathTemplate: "/api/notifications/{id}",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["updateNotification", {
    name: "updateNotification",
    description: `Update an individual Notification by ID`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"libraryId":{"type":"string","description":"The ID of the library.","format":"uuid"},"eventName":{"type":"string","description":"The name of the event the notification will fire on.","enum":["onPodcastEpisodeDownloaded","onBackupCompleted","onBackupFailed","onTest"]},"urls":{"type":"array","items":{"type":"string"},"description":"The Apprise URLs to use for the notification."},"titleTemplate":{"type":"string","description":"The template for the notification title."},"bodyTemplate":{"type":"string","description":"The template for the notification body."},"enabled":{"type":"boolean","default":false,"description":"Whether the notification is enabled."},"type":{"type":["string","null"],"enum":["info","success","warning","failure"],"default":"info","description":"The notification's type."}},"description":"The JSON request body."}}},
    method: "patch",
    pathTemplate: "/api/notifications/{id}",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["sendTestNotification", {
    name: "sendTestNotification",
    description: `Send a test to the given notification by ID.`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/notifications/{id}/test",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["createPodcast", {
    name: "createPodcast",
    description: `Create a new podcast`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","description":"A podcast containing multiple episodes.","properties":{"id":{"type":"string","description":"The ID of podcasts and podcast episodes after 2.3.0.","format":"uuid"},"libraryItemId":{"type":"string","description":"The ID of library items after 2.3.0.","format":"uuid"},"metadata":{"type":"object","description":"Metadata for a podcast.","properties":{"title":{"type":["string","null"],"description":"The title of the podcast."},"author":{"type":["string","null"],"description":"The author of the podcast."},"description":{"type":["string","null"],"description":"The description of the podcast."},"releaseDate":{"type":["string","null"],"format":"date-time","description":"The release date of the podcast."},"genres":{"type":"array","description":"The genres of the podcast.","items":{"type":"string"}},"feedUrl":{"type":["string","null"],"description":"The URL of the podcast feed."},"imageUrl":{"type":["string","null"],"description":"The URL of the podcast's image."},"itunesPageUrl":{"type":["string","null"],"description":"The URL of the podcast's iTunes page."},"itunesId":{"type":["string","null"],"description":"The iTunes ID of the podcast."},"itunesArtistId":{"type":["string","null"],"description":"The iTunes artist ID of the podcast."},"explicit":{"type":"boolean","description":"Whether the podcast contains explicit content."},"language":{"type":["string","null"],"description":"The language of the podcast."},"type":{"type":["string","null"],"description":"The type of podcast (e.g., episodic, serial)."}}},"coverPath":{"type":["string","null"],"description":"The file path to the podcast's cover image."},"tags":{"type":"array","description":"The tags associated with the podcast.","items":{"type":"string"}},"episodes":{"type":"array","description":"The episodes of the podcast.","items":{"type":"object","description":"A single episode of a podcast.","properties":{"libraryItemId":{"type":"string","description":"The ID of library items after 2.3.0.","format":"uuid"},"podcastId":{"type":"string","description":"The ID of podcasts and podcast episodes after 2.3.0.","format":"uuid"},"id":{"type":"string","description":"The ID of podcasts and podcast episodes after 2.3.0.","format":"uuid"},"oldEpisodeId":{"description":"The ID of podcasts on server version 2.2.23 and before.","type":["string","null"],"format":"pod_[a-z0-9]{18}"},"index":{"type":["number","null"],"description":"The index of the episode within the podcast."},"season":{"type":["string","null"],"description":"The season number of the episode."},"episode":{"type":["string","null"],"description":"The episode number within the season."},"episodeType":{"type":["string","null"],"description":"The type of episode (e.g., full, trailer)."},"title":{"type":["string","null"],"description":"The title of the episode."},"subtitle":{"type":["string","null"],"description":"The subtitle of the episode."},"description":{"type":["string","null"],"description":"The description of the episode."},"enclosure":{"type":["object","null"],"description":"The enclosure object containing additional episode data.","additionalProperties":true},"guid":{"type":["string","null"],"description":"The globally unique identifier for the episode."},"pubDate":{"type":["string","null"],"description":"The publication date of the episode."},"chapters":{"type":"array","description":"The chapters within the episode.","items":{"type":"object"}},"audioFile":{"type":"object","description":"An audio file for a book. Includes audio metadata and track numbers.","properties":{"index":{"description":"The index of the audio file.","type":"number"},"ino":{"description":"The inode of the item in the file system.","type":"string","format":"[0-9]*"},"metadata":{"type":["object","null"],"description":"The metadata for a file, including the path, size, and unix timestamps of the file.","properties":{"filename":{"description":"The filename of the file.","type":"string","example":"Wizards First Rule 01.mp3"},"ext":{"description":"The file extension of the file.","type":"string","example":".mp3"},"path":{"description":"The absolute path on the server of the file.","type":"string","example":"/audiobooks/Terry Goodkind/Sword of Truth/Wizards First Rule/Terry Goodkind - SOT Bk01 - Wizards First Rule 01.mp3"},"relPath":{"description":"The path of the file, relative to the book's or podcast's folder.","type":"string","example":"Wizards First Rule 01.mp3"},"size":{"description":"The total size (in bytes) of the item or file.","type":"integer","example":268824228},"mtimeMs":{"description":"The time (in ms since POSIX epoch) when the file was last modified on disk.","type":"integer","example":1632223180278},"ctimeMs":{"description":"The time (in ms since POSIX epoch) when the file status was changed on disk.","type":"integer","example":1645978261001},"birthtimeMs":{"description":"The time (in ms since POSIX epoch) when the file was created on disk. Will be 0 if unknown.","type":"integer","example":0}}},"addedAt":{"type":"number","description":"The time (in ms since POSIX epoch) when added to the server."},"updatedAt":{"type":"number","description":"The time (in ms since POSIX epoch) when last updated."},"trackNumFromMeta":{"description":"The track number of the audio file as pulled from the file's metadata. Will be null if unknown.","type":["number","null"]},"discNumFromMeta":{"description":"The disc number of the audio file as pulled from the file's metadata. Will be null if unknown.","type":["string","null"]},"trackNumFromFilename":{"description":"The track number of the audio file as determined from the file's name. Will be null if unknown.","type":["number","null"]},"discNumFromFilename":{"description":"The disc number of the audio file as determined from the file's name. Will be null if unknown.","type":["string","null"]},"manuallyVerified":{"description":"Whether the audio file has been manually verified by a user.","type":"boolean"},"invalid":{"description":"Whether the audio file is missing from the server.","type":"boolean"},"exclude":{"description":"Whether the audio file has been marked for exclusion.","type":"boolean"},"error":{"description":"Any error with the audio file. Will be null if there is none.","type":["string","null"]},"format":{"description":"The format of the audio file.","type":"string"},"duration":{"description":"The total length (in seconds) of the item or file.","type":"number"},"bitRate":{"description":"The bit rate (in bit/s) of the audio file.","type":"number"},"language":{"description":"The language of the audio file.","type":["string","null"]},"codec":{"description":"The codec of the audio file.","type":"string"},"timeBase":{"description":"The time base of the audio file.","type":"string"},"channels":{"description":"The number of channels the audio file has.","type":"number"},"channelLayout":{"description":"The layout of the audio file's channels.","type":"string"},"chapters":{"description":"If the audio file is part of an audiobook, the chapters the file contains.","type":"array","items":{"type":"object","description":"A book chapter. Includes the title and timestamps.","properties":{"id":{"description":"The ID of the book chapter.","type":"number"},"start":{"description":"When in the book (in seconds) the chapter starts.","type":"number"},"end":{"description":"When in the book (in seconds) the chapter ends.","type":"number"},"title":{"description":"The title of the chapter.","type":"string"}}}},"embeddedCoverArt":{"description":"The type of embedded cover art in the audio file. Will be null if none exists.","type":["string","null"]},"metaTags":{"description":"ID3 metadata tags pulled from the audio file on import. Only non-null tags will be returned in requests.","type":"object","properties":{"tagAlbum":{"type":["string","null"]},"tagArtist":{"type":["string","null"]},"tagGenre":{"type":["string","null"]},"tagTitle":{"type":["string","null"]},"tagSeries":{"type":["string","null"]},"tagSeriesPart":{"type":["string","null"]},"tagTrack":{"type":["string","null"]},"tagDisc":{"type":["string","null"]},"tagSubtitle":{"type":["string","null"]},"tagAlbumArtist":{"type":["string","null"]},"tagDate":{"type":["string","null"]},"tagComposer":{"type":["string","null"]},"tagPublisher":{"type":["string","null"]},"tagComment":{"type":["string","null"]},"tagDescription":{"type":["string","null"]},"tagEncoder":{"type":["string","null"]},"tagEncodedBy":{"type":["string","null"]},"tagIsbn":{"type":["string","null"]},"tagLanguage":{"type":["string","null"]},"tagASIN":{"type":["string","null"]},"tagOverdriveMediaMarker":{"type":["string","null"]},"tagOriginalYear":{"type":["string","null"]},"tagReleaseCountry":{"type":["string","null"]},"tagReleaseType":{"type":["string","null"]},"tagReleaseStatus":{"type":["string","null"]},"tagISRC":{"type":["string","null"]},"tagMusicBrainzTrackId":{"type":["string","null"]},"tagMusicBrainzAlbumId":{"type":["string","null"]},"tagMusicBrainzAlbumArtistId":{"type":["string","null"]},"tagMusicBrainzArtistId":{"type":["string","null"]}}},"mimeType":{"description":"The MIME type of the audio file.","type":"string"}}},"publishedAt":{"type":"number","description":"The time (in ms since POSIX epoch) when was created."},"addedAt":{"type":"number","description":"The time (in ms since POSIX epoch) when added to the server."},"updatedAt":{"type":"number","description":"The time (in ms since POSIX epoch) when last updated."},"audioTrack":{"type":"object","description":"Represents an audio track with various properties.","properties":{"index":{"type":["number","null"],"description":"The index of the audio track."},"startOffset":{"type":["number","null"],"format":"float","description":"The start offset of the audio track in seconds."},"duration":{"type":["number","null"],"format":"float","description":"The duration of the audio track in seconds."},"title":{"type":["string","null"],"description":"The title of the audio track."},"contentUrl":{"type":["string","null"],"description":"The URL where the audio track content is located."},"mimeType":{"type":["string","null"],"description":"The MIME type of the audio track."},"codec":{"type":["string","null"],"description":"The codec used for the audio track."},"metadata":{"type":["object","null"],"description":"The metadata for a file, including the path, size, and unix timestamps of the file.","properties":{"filename":{"description":"The filename of the file.","type":"string","example":"Wizards First Rule 01.mp3"},"ext":{"description":"The file extension of the file.","type":"string","example":".mp3"},"path":{"description":"The absolute path on the server of the file.","type":"string","example":"/audiobooks/Terry Goodkind/Sword of Truth/Wizards First Rule/Terry Goodkind - SOT Bk01 - Wizards First Rule 01.mp3"},"relPath":{"description":"The path of the file, relative to the book's or podcast's folder.","type":"string","example":"Wizards First Rule 01.mp3"},"size":{"description":"The total size (in bytes) of the item or file.","type":"integer","example":268824228},"mtimeMs":{"description":"The time (in ms since POSIX epoch) when the file was last modified on disk.","type":"integer","example":1632223180278},"ctimeMs":{"description":"The time (in ms since POSIX epoch) when the file status was changed on disk.","type":"integer","example":1645978261001},"birthtimeMs":{"description":"The time (in ms since POSIX epoch) when the file was created on disk. Will be 0 if unknown.","type":"integer","example":0}}}}},"duration":{"description":"The total length (in seconds) of the item or file.","type":"number"},"size":{"description":"The total size (in bytes) of the item or file.","type":"number"}}}},"autoDownloadEpisodes":{"type":"boolean","description":"Whether episodes are automatically downloaded."},"autoDownloadSchedule":{"type":["string","null"],"description":"The schedule for automatic episode downloads, in cron format."},"lastEpisodeCheck":{"type":"number","description":"The timestamp of the last episode check."},"maxEpisodesToKeep":{"type":"number","description":"The maximum number of episodes to keep."},"maxNewEpisodesToDownload":{"type":"number","description":"The maximum number of new episodes to download when automatically downloading epsiodes."},"lastCoverSearch":{"type":["number","null"],"description":"The timestamp of the last cover search."},"lastCoverSearchQuery":{"type":["string","null"],"description":"The query used for the last cover search."},"size":{"type":"number","description":"The total size of all episodes in bytes."},"duration":{"type":"number","description":"The total duration of all episodes in seconds."},"numTracks":{"type":"number","description":"The number of tracks (episodes) in the podcast."},"latestEpisodePublished":{"type":"number","description":"The timestamp of the most recently published episode."}}}},"required":["requestBody"]},
    method: "post",
    pathTemplate: "/api/podcasts",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["getPodcastFeed", {
    name: "getPodcastFeed",
    description: `Get podcast feed`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"rssFeed":{"type":"string","description":"The RSS feed URL of the podcast"}},"description":"The JSON request body."}},"required":["requestBody"]},
    method: "post",
    pathTemplate: "/api/podcasts/feed",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["getFeedsFromOPMLText", {
    name: "getFeedsFromOPMLText",
    description: `Parse OPML text and return an array of feeds`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"opmlText":{"type":"string"}},"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/api/podcasts/opml/parse",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["bulkCreatePodcastsFromOpmlFeedUrls", {
    name: "bulkCreatePodcastsFromOpmlFeedUrls",
    description: `Bulk create podcasts from OPML feed URLs`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"feeds":{"type":"array","items":{"type":"string"}},"libraryId":{"type":"string","description":"The ID of the library.","format":"uuid"},"folderId":{"type":"string","description":"The ID of the folder.","format":"uuid"},"autoDownloadEpisodes":{"type":"boolean","description":"Whether episodes are automatically downloaded."}},"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/api/podcasts/opml/create",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["checkNewEpisodes", {
    name: "checkNewEpisodes",
    description: `Check and download new episodes`,
    inputSchema: {"type":"object","properties":{"limit":{"type":"number","description":"Maximum number of episodes to download"}}},
    method: "get",
    pathTemplate: "/api/podcasts/{id}/checknew",
    executionParameters: [{"name":"limit","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["clearEpisodeDownloadQueue", {
    name: "clearEpisodeDownloadQueue",
    description: `Clear episode download queue`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/podcasts/{id}/clear-queue",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["getEpisodeDownloads", {
    name: "getEpisodeDownloads",
    description: `Get episode downloads`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/podcasts/{id}/downloads",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["findEpisode", {
    name: "findEpisode",
    description: `Find episode by title`,
    inputSchema: {"type":"object","properties":{"title":{"type":"string","description":"Title of the episode to search for"}},"required":["title"]},
    method: "get",
    pathTemplate: "/api/podcasts/{id}/search-episode",
    executionParameters: [{"name":"title","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["downloadEpisodes", {
    name: "downloadEpisodes",
    description: `Download podcast episodes`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"array","items":{"type":"string"},"description":"The JSON request body."}},"required":["requestBody"]},
    method: "post",
    pathTemplate: "/api/podcasts/{id}/download-episodes",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["quickMatchEpisodes", {
    name: "quickMatchEpisodes",
    description: `Quick match podcast episodes`,
    inputSchema: {"type":"object","properties":{"override":{"type":"string","description":"Override existing details if set to 1"}}},
    method: "post",
    pathTemplate: "/api/podcasts/{id}/match-episodes",
    executionParameters: [{"name":"override","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["getEpisode", {
    name: "getEpisode",
    description: `Get a specific podcast episode`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/podcasts/{id}/episode/{episodeId}",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["removeEpisode", {
    name: "removeEpisode",
    description: `Remove a podcast episode`,
    inputSchema: {"type":"object","properties":{"hard":{"type":"string","description":"Hard delete the episode if set to 1"}}},
    method: "delete",
    pathTemplate: "/api/podcasts/{id}/episode/{episodeId}",
    executionParameters: [{"name":"hard","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["updateEpisode", {
    name: "updateEpisode",
    description: `Update a podcast episode`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","description":"The JSON request body."}},"required":["requestBody"]},
    method: "patch",
    pathTemplate: "/api/podcasts/{id}/episode/{episodeId}",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["getSeries", {
    name: "getSeries",
    description: `Get a series by ID.`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"include":{"type":"string","description":"A comma separated list of what to include with the series.","enum":["progress","rssfeed","progress,rssfeed","rssfeed,progress"]}},"description":"A comma separated list of what to include with the series."}}},
    method: "get",
    pathTemplate: "/api/series/{id}",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["updateSeries", {
    name: "updateSeries",
    description: `Update a series by ID.`,
    inputSchema: {"type":"object","properties":{"requestBody":{"properties":{"name":{"description":"The name of the series.","type":"string","example":"Sword of Truth"},"description":{"description":"A description for the series. Will be null if there is none.","type":"string","nullable":true,"example":"The Sword of Truth is a series of twenty one epic fantasy novels written by Terry Goodkind."}},"description":"The series to update."}},"required":["requestBody"]},
    method: "patch",
    pathTemplate: "/api/series/{id}",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":[]}]
  }],
]);

/**
 * Security schemes from the OpenAPI spec
 */
const securitySchemes =   {
    "BearerAuth": {
      "description": "Bearer authentication",
      "type": "http",
      "scheme": "bearer"
    }
  };


server.setRequestHandler(ListToolsRequestSchema, async () => {
  const toolsForClient: Tool[] = Array.from(toolDefinitionMap.values()).map(def => ({
    name: def.name,
    description: def.description,
    inputSchema: def.inputSchema
  }));
  return { tools: toolsForClient };
});


server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest): Promise<CallToolResult> => {
  const { name: toolName, arguments: toolArgs } = request.params;
  const toolDefinition = toolDefinitionMap.get(toolName);
  if (!toolDefinition) {
    console.error(`Error: Unknown tool requested: ${toolName}`);
    return { content: [{ type: "text", text: `Error: Unknown tool requested: ${toolName}` }] };
  }
  return await executeApiTool(toolName, toolDefinition, toolArgs ?? {}, securitySchemes);
});



/**
 * Type definition for cached OAuth tokens
 */
interface TokenCacheEntry {
    token: string;
    expiresAt: number;
}

/**
 * Declare global __oauthTokenCache property for TypeScript
 */
declare global {
    var __oauthTokenCache: Record<string, TokenCacheEntry> | undefined;
}

/**
 * Acquires an OAuth2 token using client credentials flow
 * 
 * @param schemeName Name of the security scheme
 * @param scheme OAuth2 security scheme
 * @returns Acquired token or null if unable to acquire
 */
async function acquireOAuth2Token(schemeName: string, scheme: any): Promise<string | null | undefined> {
    try {
        // Check if we have the necessary credentials
        const clientId = process.env[`OAUTH_CLIENT_ID_SCHEMENAME`];
        const clientSecret = process.env[`OAUTH_CLIENT_SECRET_SCHEMENAME`];
        const scopes = process.env[`OAUTH_SCOPES_SCHEMENAME`];
        
        if (!clientId || !clientSecret) {
            console.error(`Missing client credentials for OAuth2 scheme '${schemeName}'`);
            return null;
        }
        
        // Initialize token cache if needed
        if (typeof global.__oauthTokenCache === 'undefined') {
            global.__oauthTokenCache = {};
        }
        
        // Check if we have a cached token
        const cacheKey = `${schemeName}_${clientId}`;
        const cachedToken = global.__oauthTokenCache[cacheKey];
        const now = Date.now();
        
        if (cachedToken && cachedToken.expiresAt > now) {
            console.error(`Using cached OAuth2 token for '${schemeName}' (expires in ${Math.floor((cachedToken.expiresAt - now) / 1000)} seconds)`);
            return cachedToken.token;
        }
        
        // Determine token URL based on flow type
        let tokenUrl = '';
        if (scheme.flows?.clientCredentials?.tokenUrl) {
            tokenUrl = scheme.flows.clientCredentials.tokenUrl;
            console.error(`Using client credentials flow for '${schemeName}'`);
        } else if (scheme.flows?.password?.tokenUrl) {
            tokenUrl = scheme.flows.password.tokenUrl;
            console.error(`Using password flow for '${schemeName}'`);
        } else {
            console.error(`No supported OAuth2 flow found for '${schemeName}'`);
            return null;
        }
        
        // Prepare the token request
        let formData = new URLSearchParams();
        formData.append('grant_type', 'client_credentials');
        
        // Add scopes if specified
        if (scopes) {
            formData.append('scope', scopes);
        }
        
        console.error(`Requesting OAuth2 token from ${tokenUrl}`);
        
        // Make the token request
        const response = await axios({
            method: 'POST',
            url: tokenUrl,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
            },
            data: formData.toString()
        });
        
        // Process the response
        if (response.data?.access_token) {
            const token = response.data.access_token;
            const expiresIn = response.data.expires_in || 3600; // Default to 1 hour
            
            // Cache the token
            global.__oauthTokenCache[cacheKey] = {
                token,
                expiresAt: now + (expiresIn * 1000) - 60000 // Expire 1 minute early
            };
            
            console.error(`Successfully acquired OAuth2 token for '${schemeName}' (expires in ${expiresIn} seconds)`);
            return token;
        } else {
            console.error(`Failed to acquire OAuth2 token for '${schemeName}': No access_token in response`);
            return null;
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error acquiring OAuth2 token for '${schemeName}':`, errorMessage);
        return null;
    }
}


/**
 * Executes an API tool with the provided arguments
 * 
 * @param toolName Name of the tool to execute
 * @param definition Tool definition
 * @param toolArgs Arguments provided by the user
 * @param allSecuritySchemes Security schemes from the OpenAPI spec
 * @returns Call tool result
 */
async function executeApiTool(
    toolName: string,
    definition: McpToolDefinition,
    toolArgs: JsonObject,
    allSecuritySchemes: Record<string, any>
): Promise<CallToolResult> {
  try {
    // Validate arguments against the input schema
    let validatedArgs: JsonObject;
    try {
        const zodSchema = getZodSchemaFromJsonSchema(definition.inputSchema, toolName);
        const argsToParse = (typeof toolArgs === 'object' && toolArgs !== null) ? toolArgs : {};
        validatedArgs = zodSchema.parse(argsToParse);
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            const validationErrorMessage = `Invalid arguments for tool '${toolName}': ${error.errors.map(e => `${e.path.join('.')} (${e.code}): ${e.message}`).join(', ')}`;
            return { content: [{ type: 'text', text: validationErrorMessage }] };
        } else {
             const errorMessage = error instanceof Error ? error.message : String(error);
             return { content: [{ type: 'text', text: `Internal error during validation setup: ${errorMessage}` }] };
        }
    }

    // Prepare URL, query parameters, headers, and request body
    let urlPath = definition.pathTemplate;
    const queryParams: Record<string, any> = {};
    const headers: Record<string, string> = { 'Accept': 'application/json' };
    let requestBodyData: any = undefined;

    // Apply parameters to the URL path, query, or headers
    definition.executionParameters.forEach((param) => {
        const value = validatedArgs[param.name];
        if (typeof value !== 'undefined' && value !== null) {
            if (param.in === 'path') {
                urlPath = urlPath.replace(`{${param.name}}`, encodeURIComponent(String(value)));
            }
            else if (param.in === 'query') {
                queryParams[param.name] = value;
            }
            else if (param.in === 'header') {
                headers[param.name.toLowerCase()] = String(value);
            }
        }
    });

    // Ensure all path parameters are resolved
    if (urlPath.includes('{')) {
        throw new Error(`Failed to resolve path parameters: ${urlPath}`);
    }
    
    // Construct the full URL
    const requestUrl = API_BASE_URL ? `${API_BASE_URL}${urlPath}` : urlPath;

    // Handle request body if needed
    if (definition.requestBodyContentType && typeof validatedArgs['requestBody'] !== 'undefined') {
        requestBodyData = validatedArgs['requestBody'];
        headers['content-type'] = definition.requestBodyContentType;
    }


    // Apply security requirements if available
    // Security requirements use OR between array items and AND within each object
    const appliedSecurity = definition.securityRequirements?.find(req => {
        // Try each security requirement (combined with OR)
        return Object.entries(req).every(([schemeName, scopesArray]) => {
            const scheme = allSecuritySchemes[schemeName];
            if (!scheme) return false;
            
            // API Key security (header, query, cookie)
            if (scheme.type === 'apiKey') {
                return !!process.env[`API_KEY_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
            }
            
            // HTTP security (basic, bearer)
            if (scheme.type === 'http') {
                if (scheme.scheme?.toLowerCase() === 'bearer') {
                    return !!process.env[`BEARER_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                }
                else if (scheme.scheme?.toLowerCase() === 'basic') {
                    return !!process.env[`BASIC_USERNAME_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`] && 
                           !!process.env[`BASIC_PASSWORD_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                }
            }
            
            // OAuth2 security
            if (scheme.type === 'oauth2') {
                // Check for pre-existing token
                if (process.env[`OAUTH_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`]) {
                    return true;
                }
                
                // Check for client credentials for auto-acquisition
                if (process.env[`OAUTH_CLIENT_ID_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`] &&
                    process.env[`OAUTH_CLIENT_SECRET_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`]) {
                    // Verify we have a supported flow
                    if (scheme.flows?.clientCredentials || scheme.flows?.password) {
                        return true;
                    }
                }
                
                return false;
            }
            
            // OpenID Connect
            if (scheme.type === 'openIdConnect') {
                return !!process.env[`OPENID_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
            }
            
            return false;
        });
    });

    // If we found matching security scheme(s), apply them
    if (appliedSecurity) {
        // Apply each security scheme from this requirement (combined with AND)
        for (const [schemeName, scopesArray] of Object.entries(appliedSecurity)) {
            const scheme = allSecuritySchemes[schemeName];
            
            // API Key security
            if (scheme?.type === 'apiKey') {
                const apiKey = process.env[`API_KEY_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                if (apiKey) {
                    if (scheme.in === 'header') {
                        headers[scheme.name.toLowerCase()] = apiKey;
                        console.error(`Applied API key '${schemeName}' in header '${scheme.name}'`);
                    }
                    else if (scheme.in === 'query') {
                        queryParams[scheme.name] = apiKey;
                        console.error(`Applied API key '${schemeName}' in query parameter '${scheme.name}'`);
                    }
                    else if (scheme.in === 'cookie') {
                        // Add the cookie, preserving other cookies if they exist
                        headers['cookie'] = `${scheme.name}=${apiKey}${headers['cookie'] ? `; ${headers['cookie']}` : ''}`;
                        console.error(`Applied API key '${schemeName}' in cookie '${scheme.name}'`);
                    }
                }
            } 
            // HTTP security (Bearer or Basic)
            else if (scheme?.type === 'http') {
                if (scheme.scheme?.toLowerCase() === 'bearer') {
                    const token = process.env[`BEARER_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                    if (token) {
                        headers['authorization'] = `Bearer ${token}`;
                        console.error(`Applied Bearer token for '${schemeName}'`);
                    }
                } 
                else if (scheme.scheme?.toLowerCase() === 'basic') {
                    const username = process.env[`BASIC_USERNAME_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                    const password = process.env[`BASIC_PASSWORD_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                    if (username && password) {
                        headers['authorization'] = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
                        console.error(`Applied Basic authentication for '${schemeName}'`);
                    }
                }
            }
            // OAuth2 security
            else if (scheme?.type === 'oauth2') {
                // First try to use a pre-provided token
                let token = process.env[`OAUTH_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                
                // If no token but we have client credentials, try to acquire a token
                if (!token && (scheme.flows?.clientCredentials || scheme.flows?.password)) {
                    console.error(`Attempting to acquire OAuth token for '${schemeName}'`);
                    token = (await acquireOAuth2Token(schemeName, scheme)) ?? '';
                }
                
                // Apply token if available
                if (token) {
                    headers['authorization'] = `Bearer ${token}`;
                    console.error(`Applied OAuth2 token for '${schemeName}'`);
                    
                    // List the scopes that were requested, if any
                    const scopes = scopesArray as string[];
                    if (scopes && scopes.length > 0) {
                        console.error(`Requested scopes: ${scopes.join(', ')}`);
                    }
                }
            }
            // OpenID Connect
            else if (scheme?.type === 'openIdConnect') {
                const token = process.env[`OPENID_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                if (token) {
                    headers['authorization'] = `Bearer ${token}`;
                    console.error(`Applied OpenID Connect token for '${schemeName}'`);
                    
                    // List the scopes that were requested, if any
                    const scopes = scopesArray as string[];
                    if (scopes && scopes.length > 0) {
                        console.error(`Requested scopes: ${scopes.join(', ')}`);
                    }
                }
            }
        }
    } 
    // Log warning if security is required but not available
    else if (definition.securityRequirements?.length > 0) {
        // First generate a more readable representation of the security requirements
        const securityRequirementsString = definition.securityRequirements
            .map(req => {
                const parts = Object.entries(req)
                    .map(([name, scopesArray]) => {
                        const scopes = scopesArray as string[];
                        if (scopes.length === 0) return name;
                        return `${name} (scopes: ${scopes.join(', ')})`;
                    })
                    .join(' AND ');
                return `[${parts}]`;
            })
            .join(' OR ');
            
        console.warn(`Tool '${toolName}' requires security: ${securityRequirementsString}, but no suitable credentials found.`);
    }
    

    // Prepare the axios request configuration
    const config: AxiosRequestConfig = {
      method: definition.method.toUpperCase(), 
      url: requestUrl, 
      params: queryParams, 
      headers: headers,
      ...(requestBodyData !== undefined && { data: requestBodyData }),
    };

    // Log request info to stderr (doesn't affect MCP output)
    console.error(`Executing tool "${toolName}": ${config.method} ${config.url}`);
    
    // Execute the request
    const response = await axios(config);

    // Process and format the response
    let responseText = '';
    const contentType = response.headers['content-type']?.toLowerCase() || '';
    
    // Handle JSON responses
    if (contentType.includes('application/json') && typeof response.data === 'object' && response.data !== null) {
         try { 
             responseText = JSON.stringify(response.data, null, 2); 
         } catch (e) { 
             responseText = "[Stringify Error]"; 
         }
    } 
    // Handle string responses
    else if (typeof response.data === 'string') { 
         responseText = response.data; 
    }
    // Handle other response types
    else if (response.data !== undefined && response.data !== null) { 
         responseText = String(response.data); 
    }
    // Handle empty responses
    else { 
         responseText = `(Status: ${response.status} - No body content)`; 
    }
    
    // Return formatted response
    return { 
        content: [ 
            { 
                type: "text", 
                text: `API Response (Status: ${response.status}):\n${responseText}` 
            } 
        ], 
    };

  } catch (error: unknown) {
    // Handle errors during execution
    let errorMessage: string;
    
    // Format Axios errors specially
    if (axios.isAxiosError(error)) { 
        errorMessage = formatApiError(error); 
    }
    // Handle standard errors
    else if (error instanceof Error) { 
        errorMessage = error.message; 
    }
    // Handle unexpected error types
    else { 
        errorMessage = 'Unexpected error: ' + String(error); 
    }
    
    // Log error to stderr
    console.error(`Error during execution of tool '${toolName}':`, errorMessage);
    
    // Return error message to client
    return { content: [{ type: "text", text: errorMessage }] };
  }
}


/**
 * Main function to start the server
 */
async function main() {
// Set up StreamableHTTP transport
  try {
    await setupStreamableHttpServer(server, 3000);
  } catch (error) {
    console.error("Error setting up StreamableHTTP server:", error);
    process.exit(1);
  }
}

/**
 * Cleanup function for graceful shutdown
 */
async function cleanup() {
    console.error("Shutting down MCP server...");
    process.exit(0);
}

// Register signal handlers
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Start the server
main().catch((error) => {
  console.error("Fatal error in main execution:", error);
  process.exit(1);
});

/**
 * Formats API errors for better readability
 * 
 * @param error Axios error
 * @returns Formatted error message
 */
function formatApiError(error: AxiosError): string {
    let message = 'API request failed.';
    if (error.response) {
        message = `API Error: Status ${error.response.status} (${error.response.statusText || 'Status text not available'}). `;
        const responseData = error.response.data;
        const MAX_LEN = 200;
        if (typeof responseData === 'string') { 
            message += `Response: ${responseData.substring(0, MAX_LEN)}${responseData.length > MAX_LEN ? '...' : ''}`; 
        }
        else if (responseData) { 
            try { 
                const jsonString = JSON.stringify(responseData); 
                message += `Response: ${jsonString.substring(0, MAX_LEN)}${jsonString.length > MAX_LEN ? '...' : ''}`; 
            } catch { 
                message += 'Response: [Could not serialize data]'; 
            } 
        }
        else { 
            message += 'No response body received.'; 
        }
    } else if (error.request) {
        message = 'API Network Error: No response received from server.';
        if (error.code) message += ` (Code: ${error.code})`;
    } else { 
        message += `API Request Setup Error: ${error.message}`; 
    }
    return message;
}

/**
 * Converts a JSON Schema to a Zod schema for runtime validation
 * 
 * @param jsonSchema JSON Schema
 * @param toolName Tool name for error reporting
 * @returns Zod schema
 */
function getZodSchemaFromJsonSchema(jsonSchema: any, toolName: string): z.ZodTypeAny {
    if (typeof jsonSchema !== 'object' || jsonSchema === null) { 
        return z.object({}).passthrough(); 
    }
    try {
        const zodSchemaString = jsonSchemaToZod(jsonSchema);
        const zodSchema = eval(zodSchemaString);
        if (typeof zodSchema?.parse !== 'function') { 
            throw new Error('Eval did not produce a valid Zod schema.'); 
        }
        return zodSchema as z.ZodTypeAny;
    } catch (err: any) {
        console.error(`Failed to generate/evaluate Zod schema for '${toolName}':`, err);
        return z.object({}).passthrough();
    }
}
