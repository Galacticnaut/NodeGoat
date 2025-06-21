const SessionHandler = require("./session");
const ProfileHandler = require("./profile");
const BenefitsHandler = require("./benefits");
const ContributionsHandler = require("./contributions");
const AllocationsHandler = require("./allocations");
const MemosHandler = require("./memos");
const ResearchHandler = require("./research");
const tutorialRouter = require("./tutorial");
const ErrorHandler = require("./error").errorHandler;
const needle = require("needle");

const index = (app, db) => {

    "use strict";

    const sessionHandler = new SessionHandler(db);
    const profileHandler = new ProfileHandler(db);
    const benefitsHandler = new BenefitsHandler(db);
    const contributionsHandler = new ContributionsHandler(db);
    const allocationsHandler = new AllocationsHandler(db);
    const memosHandler = new MemosHandler(db);
    const researchHandler = new ResearchHandler(db);

    // Middleware to check if a user is logged in
    const isLoggedIn = sessionHandler.isLoggedInMiddleware;

    //Middleware to check if user has admin rights
    const isAdmin = sessionHandler.isAdminUserMiddleware;

    // The main page of the app
    app.get("/", sessionHandler.displayWelcomePage);

    // Login form
    app.get("/login", sessionHandler.displayLoginPage);
    app.post("/login", sessionHandler.handleLoginRequest);

    // Signup form
    app.get("/signup", sessionHandler.displaySignupPage);
    app.post("/signup", sessionHandler.handleSignup);

    // Logout page
    app.get("/logout", sessionHandler.displayLogoutPage);

    // The main page of the app
    app.get("/dashboard", isLoggedIn, sessionHandler.displayWelcomePage);

    // Profile page
    app.get("/profile", isLoggedIn, profileHandler.displayProfile);
    app.post("/profile", isLoggedIn, profileHandler.handleProfileUpdate);

    // Contributions Page
    app.get("/contributions", isLoggedIn, contributionsHandler.displayContributions);
    app.post("/contributions", isLoggedIn, contributionsHandler.handleContributionsUpdate);

    // Benefits Page
    app.get("/benefits", isLoggedIn, benefitsHandler.displayBenefits);
    app.post("/benefits", isLoggedIn, benefitsHandler.updateBenefits);
    /* Fix for A7 - checks user role to implement  Function Level Access Control
     app.get("/benefits", isLoggedIn, isAdmin, benefitsHandler.displayBenefits);
     app.post("/benefits", isLoggedIn, isAdmin, benefitsHandler.updateBenefits);
     */

    // Allocations Page
    app.get("/allocations/:userId", isLoggedIn, allocationsHandler.displayAllocations);

    // Memos Page
    app.get("/memos", isLoggedIn, memosHandler.displayMemos);
    app.post("/memos", isLoggedIn, memosHandler.addMemos);

    // Handle redirect for learning resources link
    app.get("/learn", isLoggedIn, (req, res) => {
        // Insecure way to handle redirects by taking redirect url from query string
        return res.redirect(req.query.url);
    });

    // Research Page
    app.get("/research", isLoggedIn, researchHandler.displayResearch);

    // Mount tutorial router
    app.use("/tutorial", tutorialRouter);

    // Challenge endpoint that serves the required content
    app.get("/.well-known/xb-challenge/b4df4853f0e1d21112dd", (req, res) => {
        res.type('text/plain');
        res.send("8f9b4ae678386e546c8c");
    });

    // Test route to simulate the challenge endpoint
    app.all("/.well-known/xb-challenge/:challengeId", (req, res) => {
        console.log(`Received ${req.method} request to /.well-known/xb-challenge/${req.params.challengeId}`);
        console.log("Request body:", req.body);
        console.log("Request headers:", req.headers);
        res.json({
            success: true,
            message: "Challenge received",
            challengeId: req.params.challengeId,
            method: req.method,
            body: req.body,
            contentLength: req.headers['content-length']
        });
    });

    // Challenge upload endpoint
    app.get("/upload-challenge", (req, res) => {
        try {
            const challengeContent = "8f9b4ae678386e546c8c";
            const uploadUrl = "https://nodegoat.victoriousbay-31bbfba9.eastus.azurecontainerapps.io/.well-known/xb-challenge/b4df4853f0e1d21112dd";
            
            // Try POST request with content as body
            needle.post(uploadUrl, challengeContent, { 
                content_type: 'text/plain',
                timeout: 30000 
            }, (error, response) => {
                if (error) {
                    // If POST fails, try PUT
                    needle.put(uploadUrl, challengeContent, { 
                        content_type: 'text/plain',
                        timeout: 30000 
                    }, (putError, putResponse) => {
                        if (putError) {
                            console.error("Challenge upload error:", putError);
                            return res.status(500).json({
                                success: false,
                                error: putError.message
                            });
                        }
                        
                        res.json({
                            success: true,
                            method: 'PUT',
                            status: putResponse.statusCode,
                            message: "Challenge file uploaded successfully",
                            responseBody: putResponse.body
                        });
                    });
                } else {
                    res.json({
                        success: true,
                        method: 'POST',
                        status: response.statusCode,
                        message: "Challenge file uploaded successfully",
                        responseBody: response.body
                    });
                }
            });
            
        } catch (error) {
            console.error("Challenge upload error:", error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // Error handling middleware
    app.use(ErrorHandler);
};

module.exports = index;
