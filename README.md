# RedPeach TV - Premium IPTV Streaming Application

![RedPeach TV](https://via.placeholder.com/800x450/1a1a1a/cccccc?text=RedPeach+TV)

## Overview

RedPeach TV is a modern web application for streaming IPTV channels from various countries. It provides a sleek, user-friendly interface for accessing thousands of live channels in HD and 4K quality. The application supports channels from the US, Bangladesh, India, Pakistan, and custom M3U playlists.

## Features

- **Multi-Country Support**: Stream channels from US, Bangladesh, India, and Pakistan
- **Custom Playlist**: Upload and play your own M3U/M3U8 playlists
- **Channel Filtering**: Filter channels by category (Entertainment, Sports, Movies, News, Kids)
- **Search Functionality**: Quickly find channels by name
- **HLS Streaming**: High-quality streaming with HLS.js
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Error Handling**: Robust error handling for stream issues
- **Channel Information**: Display channel details including quality, category, and logo

## Project Structure

The project follows a clean separation of concerns with three main files:

- **index.html**: Contains the HTML structure of the application
- **styles.css**: Contains all CSS styling rules
- **script.js**: Contains all JavaScript functionality

## Technologies Used

- **HTML5**: For structure and content
- **CSS3**: For styling and responsive design
- **JavaScript/jQuery**: For dynamic functionality
- **Bootstrap 5**: For responsive layout and components
- **Font Awesome**: For icons
- **HLS.js**: For HLS video streaming

## How It Works

1. **Channel Loading**: The application fetches M3U playlists from IPTV-org's GitHub repository for different countries
2. **M3U Parsing**: Parses the M3U file to extract channel information (name, logo, category, quality)
3. **Channel Display**: Organizes channels by category and displays them in a scrollable list
4. **Video Playback**: Uses HLS.js for streaming with fallback to native HLS support for Safari
5. **Error Handling**: Monitors video playback and provides error messages and retry options

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection

### Installation

1. Clone the repository or download the files
2. Open `index.html` in your web browser

### Usage

1. Click on one of the channel source buttons (US, Bangladesh, India, Pakistan)
2. Wait for the channels to load
3. Browse or search for a channel
4. Click on a channel to start playback
5. Alternatively, upload your own M3U playlist using the "Load M3U Playlist" button

## Code Structure

### HTML (index.html)

The HTML file provides the structure for:
- Navigation bar
- Hero section with channel loading buttons
- Video player section
- Channel list with search and filter options
- Features and pricing sections
- Footer

### CSS (styles.css)

The CSS file contains styling for:
- Color variables and theme
- Layout and responsive design
- Component styling (buttons, cards, player)
- Animations and transitions

### JavaScript (script.js)

The JavaScript file handles:
- M3U playlist parsing
- AJAX requests to fetch channel data
- Channel display and filtering
- Video playback with HLS.js
- Error handling and recovery
- User interactions (clicks, searches, etc.)

## Customization

You can customize the application by:

1. **Adding More Countries**: Follow the pattern of existing country functions to add more sources
2. **Changing the Theme**: Modify the CSS variables in the `:root` selector
3. **Adding Features**: Extend the JavaScript functionality as needed

## Performance Considerations

- The application uses efficient DOM manipulation with jQuery
- HLS.js is configured for optimal streaming performance
- CSS is optimized for responsive design
- Error handling ensures a smooth user experience

## Browser Compatibility

- Chrome: Full support
- Firefox: Full support
- Safari: Full support (uses native HLS)
- Edge: Full support
- IE: Not supported

## License

This project is available for personal and educational use.

## Acknowledgements

- [IPTV-org](https://github.com/iptv-org) for providing the channel sources
- [HLS.js](https://github.com/video-dev/hls.js/) for the streaming library
- [Bootstrap](https://getbootstrap.com/) for the responsive framework
- [Font Awesome](https://fontawesome.com/) for the icons

---

© RedPeach TV. All rights reserved.