/**
 * Remotion reads static files (fonts, event photos) from the site's own public/ folder,
 * so the repo keeps one copy of each: fonts in public/fonts/, photos in public/clips/images/.
 * Run Remotion commands from motion/.
 */
import { Config } from '@remotion/cli/config';

Config.setPublicDir('../public');
