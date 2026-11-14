# Production deployment

- Website: https://bloomi-nine.vercel.app
- GitHub: https://github.com/elysiaa-t/bloomi
- Vercel project: etrocio-4406s-projects/bloomi
- Application source deployed from commit: `126f7ce`

The local production build and Vercel production deployment completed
successfully. HTTP checks for `/`, `/companion`, and `/progress` returned 200.
Nine deployed JavaScript assets were checked without finding the configured
OpenAI credential. No credentials or raw secret-file contents were printed.

`OPENAI_API_KEY` is configured as a sensitive Vercel environment variable for
Production and Preview. Local environment files, credential-assignment files,
and common private-key files are excluded by `.gitignore` and `.vercelignore`.
The secret was transferred from local environment memory directly to Vercel;
it was not committed or passed as a command-line argument.

The app's existing production AI restrictions remain unchanged. Both AI routes
return HTTP 403 in production, so the public demo uses checked/local learning
flows rather than exposing an unauthenticated, billable API proxy. Enabling live
hosted AI requires a separate access-control change. No features were added for
this deployment.

The deployment was published through the authenticated Vercel CLI. Automatic
GitHub-to-Vercel deployments were not connected: Vercel requires adding a GitHub
Login Connection to the current account first. Git pushes and CLI deployments
work independently of that optional connection.
