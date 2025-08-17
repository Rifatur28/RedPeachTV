$(document).ready(function() {
    // Show development modal on page load
    $('#developmentModal').modal('show');
    
    // Initialize HLS.js with better configuration
    $("#year").text(new Date().getFullYear());
    let hls = null;
    let currentVideo = document.getElementById('mainVideo');
    let currentPlayingChannel = null;
    
    // Improved HLS configuration
    const hlsConfig = {
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        maxBufferSize: 60 * 1000 * 1000,
        maxBufferHole: 0.5,
        lowLatencyMode: false,
        enableWorker: true,
        startLevel: -1, // Auto quality selection
        abrEwmaDefaultEstimate: 500000, // 500kbps initial estimate
        abrBandWidthFactor: 0.95,
        abrBandWidthUpFactor: 0.7,
        abrMaxWithRealBitrate: true
    };
    
    // M3U Parser (unchanged)
    function parseM3U(content) {
        const channels = [];
        const lines = content.split('\n');
        let currentChannel = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('#EXTINF:')) {
                currentChannel = {};
                
                // Extract metadata
                const tvgIdMatch = line.match(/tvg-id="([^"]*)"/i);
                const tvgNameMatch = line.match(/tvg-name="([^"]*)"/i);
                const tvgLogoMatch = line.match(/tvg-logo="([^"]*)"/i);
                const groupTitleMatch = line.match(/group-title="([^"]*)"/i);
                
                currentChannel.tvgId = tvgIdMatch ? tvgIdMatch[1] : '';
                currentChannel.tvgName = tvgNameMatch ? tvgNameMatch[1] : '';
                currentChannel.tvgLogo = tvgLogoMatch ? tvgLogoMatch[1] : 'https://via.placeholder.com/80/cccccc/1a1a1a?text=LOGO';
                currentChannel.groupTitle = groupTitleMatch ? groupTitleMatch[1] : 'Other';
                
                // Extract channel name
                const commaIndex = line.lastIndexOf(',');
                if (commaIndex > -1) {
                    currentChannel.name = line.substring(commaIndex + 1).trim();
                } else {
                    currentChannel.name = currentChannel.tvgName || 'Unknown Channel';
                }
                
                // Clean up channel name
                currentChannel.name = currentChannel.name
                    .replace(/\[.*?\]/g, '') // Remove [HD] or similar tags
                    .replace(/\|.*/g, '') // Remove anything after |
                    .trim();
                
                // Determine category
                if (!currentChannel.groupTitle || currentChannel.groupTitle === 'Other') {
                    const nameLower = currentChannel.name.toLowerCase();
                    if (nameLower.includes('sport') || nameLower.includes('espn') || nameLower.includes('nfl') || 
                        nameLower.includes('nba') || nameLower.includes('mlb') || nameLower.includes('nhl')) {
                        currentChannel.groupTitle = 'Sports';
                    } else if (nameLower.includes('news') || nameLower.includes('cnn') || nameLower.includes('fox news') || 
                               nameLower.includes('msnbc')) {
                        currentChannel.groupTitle = 'News';
                    } else if (nameLower.includes('movie') || nameLower.includes('hbo') || nameLower.includes('showtime') || 
                               nameLower.includes('cinemax') || nameLower.includes('starz')) {
                        currentChannel.groupTitle = 'Movies';
                    } else if (nameLower.includes('kids') || nameLower.includes('cartoon') || nameLower.includes('disney') || 
                               nameLower.includes('nick')) {
                        currentChannel.groupTitle = 'Kids';
                    } else {
                        currentChannel.groupTitle = 'Entertainment';
                    }
                }
                
                // Extract quality
                const qualityMatch = line.match(/(HD|FHD|UHD|4K|SD)/i);
                currentChannel.quality = qualityMatch ? qualityMatch[0].toUpperCase() : 'SD';
                
            } else if (line && !line.startsWith('#') && currentChannel) {
                currentChannel.url = line;
                channels.push(currentChannel);
                currentChannel = null;
            }
        }
        
        return channels;
    }
    
    // Load US channels from IPTV-org API (unchanged)
    function loadUSChannels() {
        $('#channelList').html(`
            <div class="text-center py-4">
                <div class="spinner-border text-crimson" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading US channels...</p>
            </div>
        `);
        
        $.ajax({
            url: 'https://iptv-org.github.io/iptv/countries/us.m3u',
            type: 'GET',
            success: function(data) {
                const channels = parseM3U(data);
                if (channels.length > 0) {
                    displayChannels(channels);
                    playChannel(channels[0]);
                    $('.channel-item:first').addClass('active');
                } else {
                    $('#channelList').html(`
                        <div class="text-center py-5">
                            <i class="fas fa-exclamation-triangle fa-3x text-crimson mb-3"></i>
                            <h5 class="text-peach">No channels found</h5>
                            <p class="text-muted">Failed to load US channels. Please try again later.</p>
                        </div>
                    `);
                }
            },
            error: function() {
                $('#channelList').html(`
                    <div class="text-center py-5">
                        <i class="fas fa-exclamation-triangle fa-3x text-crimson mb-3"></i>
                        <h5 class="text-peach">Error loading channels</h5>
                        <p class="text-muted">Could not connect to the IPTV service. Please try again later.</p>
                    </div>
                `);
            }
        });
    }
    
    // Load M3U file (unchanged)
    $('#loadPlaylistBtn, #loadPlaylistBtn2').click(function() {
        $('#m3uFileInput').click();
    });
    
    $('#m3uFileInput').change(function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const channels = parseM3U(content);
            
            if (channels.length === 0) {
                alert('No channels found in the M3U file or invalid format.');
                return;
            }
            
            displayChannels(channels);
            playChannel(channels[0]);
            $('.channel-item:first').addClass('active');
        };
        reader.readAsText(file);
    });


    // Load US channels button
    $('#loadUSChannelsBtn, #loadUSChannelsBtn2').click(function() {
        loadUSChannels();
    });
    
    // Load Bangladesh channels button
    $('#loadBDChannelsBtn, #loadBDChannelsBtn2').click(function() {
        loadBDChannels();
    });
    
    // Load Indian channels button
    $('#loadINChannelsBtn, #loadINChannelsBtn2').click(function() {
        loadINChannels();
    });
    
    // Load Pakistani channels button
    $('#loadPKChannelsBtn, #loadPKChannelsBtn2').click(function() {
        loadPKChannels();
    });
    
    // Function to load Bangladesh IPTV channels with multiple sources and fallback
    function loadBDChannels() {
        $('#channelList').html(`
            <div class="text-center py-4">
                <div class="spinner-border text-crimson" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading Bangladesh channels...</p>
            </div>
        `);
        
        // Use the same source format as US channels but for Bangladesh
        $.ajax({
            url: 'https://iptv-org.github.io/iptv/countries/bd.m3u',
            type: 'GET',
            success: function(data) {
                const channels = parseM3U(data);
                if (channels.length > 0) {
                    displayChannels(channels);
                    playChannel(channels[0]);
                    $('.channel-item:first').addClass('active');
                } else {
                    $('#channelList').html(`
                        <div class="text-center py-5">
                            <i class="fas fa-exclamation-triangle fa-3x text-crimson mb-3"></i>
                            <h5 class="text-peach">No channels found</h5>
                            <p class="text-muted">Failed to load Bangladesh channels. Please try again later.</p>
                        </div>
                    `);
                }
            },
            error: function() {
                $('#channelList').html(`
                    <div class="text-center py-5">
                        <i class="fas fa-exclamation-triangle fa-3x text-crimson mb-3"></i>
                        <h5 class="text-peach">Error loading channels</h5>
                        <p class="text-muted">Could not connect to the IPTV service. Please try again later.</p>
                    </div>
                `);
            }
        });
    }
    
    // Function to load Indian IPTV channels
    function loadINChannels() {
        $('#channelList').html(`
            <div class="text-center py-4">
                <div class="spinner-border text-crimson" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading Indian channels...</p>
            </div>
        `);
        
        // Use the same source format as US channels but for India
        $.ajax({
            url: 'https://iptv-org.github.io/iptv/countries/in.m3u',
            type: 'GET',
            success: function(data) {
                const channels = parseM3U(data);
                if (channels.length > 0) {
                    displayChannels(channels);
                    playChannel(channels[0]);
                    $('.channel-item:first').addClass('active');
                } else {
                    $('#channelList').html(`
                        <div class="text-center py-5">
                            <i class="fas fa-exclamation-triangle fa-3x text-crimson mb-3"></i>
                            <h5 class="text-peach">No channels found</h5>
                            <p class="text-muted">Failed to load Indian channels. Please try again later.</p>
                        </div>
                    `);
                }
            },
            error: function() {
                $('#channelList').html(`
                    <div class="text-center py-5">
                        <i class="fas fa-exclamation-triangle fa-3x text-crimson mb-3"></i>
                        <h5 class="text-peach">Error loading channels</h5>
                        <p class="text-muted">Could not connect to the IPTV service. Please try again later.</p>
                    </div>
                `);
            }
        });
    }
    
    // Function to load Pakistani IPTV channels
    function loadPKChannels() {
        $('#channelList').html(`
            <div class="text-center py-4">
                <div class="spinner-border text-crimson" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading Pakistani channels...</p>
            </div>
        `);
        
        // Use the same source format as US channels but for Pakistan
        $.ajax({
            url: 'https://iptv-org.github.io/iptv/countries/pk.m3u',
            type: 'GET',
            success: function(data) {
                const channels = parseM3U(data);
                if (channels.length > 0) {
                    displayChannels(channels);
                    playChannel(channels[0]);
                    $('.channel-item:first').addClass('active');
                } else {
                    $('#channelList').html(`
                        <div class="text-center py-5">
                            <i class="fas fa-exclamation-triangle fa-3x text-crimson mb-3"></i>
                            <h5 class="text-peach">No channels found</h5>
                            <p class="text-muted">Failed to load Pakistani channels. Please try again later.</p>
                        </div>
                    `);
                }
            },
            error: function() {
                $('#channelList').html(`
                    <div class="text-center py-5">
                        <i class="fas fa-exclamation-triangle fa-3x text-crimson mb-3"></i>
                        <h5 class="text-peach">Error loading channels</h5>
                        <p class="text-muted">Could not connect to the IPTV service. Please try again later.</p>
                    </div>
                `);
            }
        });
    }
    
    // Display channels in the playlist (unchanged)
    function displayChannels(channels) {
        const $channelList = $('#channelList');
        $channelList.empty();
        
        // Sort channels by group/category
        channels.sort((a, b) => a.groupTitle.localeCompare(b.groupTitle) || a.name.localeCompare(b.name));
        
        let currentGroup = null;
        
        channels.forEach((channel, index) => {
            // Add group header if needed
            if (channel.groupTitle !== currentGroup) {
                currentGroup = channel.groupTitle;
                $channelList.append(`
                    <div class="channel-group-header bg-dark text-peach px-3 py-2 sticky-top">
                        <i class="fas fa-folder-open me-2"></i>${currentGroup}
                    </div>
                `);
            }
            
            const $channelItem = $(`
                <div class="channel-item" data-index="${index}">
                    <div class="d-flex align-items-center">
                        <img src="${channel.tvgLogo}" alt="${channel.name}" onerror="this.src='https://via.placeholder.com/30/cccccc/1a1a1a?text=LOGO'">
                        <div class="flex-grow-1">
                            <h6 class="mb-0">${channel.name}</h6>
                            <small class="text-muted">${channel.groupTitle}</small>
                        </div>
                        <span class="badge bg-secondary ms-2">${channel.quality}</span>
                    </div>
                </div>
            `);
            
            $channelItem.click(function() {
                playChannel(channel);
                $('.channel-item').removeClass('active');
                $channelItem.addClass('active');
                
                // Scroll the item into view (for mobile)
                $channelItem[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
            
            $channelList.append($channelItem);
        });
    }
    
    // Improved playChannel function with better error handling
    function playChannel(channel) {
        currentPlayingChannel = channel;
        
        $('#currentChannelName').text(channel.name);
        $('#currentChannelGroup').text(`Category: ${channel.groupTitle}`);
        $('#currentChannelQuality').text(`Quality: ${channel.quality}`);
        $('#currentChannelLogo').attr('src', channel.tvgLogo).attr('alt', channel.name);
        $('#currentChannelStatus').removeClass('d-none');
        
        // Ensure video element is properly set up
        $('#videoPlayer').html('<video id="mainVideo" class="w-100" controls></video>');
        currentVideo = document.getElementById('mainVideo');
        
        // Destroy previous HLS instance if exists
        if (hls) {
            hls.destroy();
            hls = null;
        }
        
        // Check if browser supports native HLS playback
        if (Hls.isSupported()) {
            hls = new Hls(hlsConfig);
            
            hls.loadSource(channel.url);
            hls.attachMedia(currentVideo);
            
            hls.on(Hls.Events.MANIFEST_PARSED, function() {
                console.log('Manifest parsed, attempting to play');
                currentVideo.play().catch(e => {
                    console.log('Autoplay prevented:', e);
                    // Show play button but don't treat as error
                });
                
                // Check if video is actually playing after 3 seconds
                setTimeout(checkVideoPlayback, 3000);
            });
            
            hls.on(Hls.Events.ERROR, function(event, data) {
                console.log('HLS Error:', data);
                if (data.fatal) {
                    switch(data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.log('Network error, attempting recovery');
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.log('Media error, attempting recovery');
                            hls.recoverMediaError();
                            break;
                        default:
                            checkVideoPlayback();
                            break;
                    }
                }
            });
            
            // Check for stalled playback
            currentVideo.addEventListener('waiting', function() {
                console.log('Video waiting for data');
                setTimeout(function() {
                    if (currentVideo.readyState < 3) {
                        checkVideoPlayback();
                    }
                }, 2000);
            });
            
        } else if (currentVideo.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            currentVideo.src = channel.url;
            currentVideo.addEventListener('loadedmetadata', function() {
                currentVideo.play().catch(e => {
                    console.log('Autoplay prevented:', e);
                });
                setTimeout(checkVideoPlayback, 3000);
            });
            
            currentVideo.addEventListener('error', function() {
                checkVideoPlayback();
            });
        } else {
            showPlayerError('Your browser does not support HLS streaming');
        }
    }
    
    // Function to check if video is actually playing
    function checkVideoPlayback() {
        if (!currentVideo) return;
        
        // Check if video has valid duration and is progressing
        if (currentVideo.readyState > 0) {
            const canvas = document.createElement('canvas');
            canvas.width = 16;
            canvas.height = 16;
            const ctx = canvas.getContext('2d');
            
            // Capture a frame from the video
            ctx.drawImage(currentVideo, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let blank = true;
            
            // Check if frame has non-black pixels
            for (let i = 0; i < imageData.data.length; i += 4) {
                if (imageData.data[i] !== 0 || imageData.data[i+1] !== 0 || imageData.data[i+2] !== 0) {
                    blank = false;
                    break;
                }
            }
            
            if (blank) {
                showPlayerError('Video stream not available (audio only)');
            } else {
                // Video is playing correctly, ensure error message is hidden
                $('#videoPlayer').html('<video id="mainVideo" class="w-100" controls></video>');
                currentVideo = document.getElementById('mainVideo');
                if (hls) {
                    hls.attachMedia(currentVideo);
                } else if (currentPlayingChannel) {
                    currentVideo.src = currentPlayingChannel.url;
                }
            }
        } else {
            // Video not ready yet, check again in 1 second
            setTimeout(checkVideoPlayback, 1000);
        }
    }
    
    // Show error message in player
    function showPlayerError(message) {
        // Only show error if video isn't actually playing
        if (!currentVideo || currentVideo.readyState === 0 || currentVideo.paused) {
            $('#videoPlayer').html(`
                <div class="d-flex justify-content-center align-items-center h-100 bg-black">
                    <div class="text-center text-white p-4">
                        <i class="fas fa-exclamation-triangle fa-3x text-crimson mb-3"></i>
                        <h4>Error Loading Stream</h4>
                        <p>${message}</p>
                        <button class="btn btn-sm btn-crimson" id="retryButton">Retry</button>
                    </div>
                </div>
            `);
            
            $('#retryButton').click(function() {
                if (currentPlayingChannel) {
                    playChannel(currentPlayingChannel);
                }
            });
        }
    }
    
    // Filter channels (unchanged)
    $('.filter-option').click(function(e) {
        e.preventDefault();
        const filter = $(this).data('filter');
        
        if (filter === 'all') {
            $('.channel-item, .channel-group-header').show();
        } else {
            $('.channel-group-header').hide();
            $('.channel-item').each(function() {
                const category = $(this).find('small').text().toLowerCase();
                const showItem = category.includes(filter);
                $(this).toggle(showItem);
                
                // Show group header if any items in group are visible
                if (showItem) {
                    $(this).prevAll('.channel-group-header').first().show();
                }
            });
        }
        
        $('#filterDropdown').text($(this).text());
    });
    
    // Smooth scroll with offset for all anchor links
    $(document).on('click', 'a[href^="#"]', function(e) {
        e.preventDefault();
        const target = $(this.getAttribute('href'));
        if (target.length) {
            const navbarHeight = $('.navbar').outerHeight();
            $('html, body').stop().animate({
                scrollTop: target.offset().top - navbarHeight
            }, 800);
        }
    });

    // For channel items specifically
    $('.channel-item').click(function(e) {
        const channelIndex = $(this).data('index');
        const channel = channels[channelIndex];
        playChannel(channel);
        
        // Smooth scroll to player section with offset
        const playerSection = $('#channels');
        const navbarHeight = $('.navbar').outerHeight();
        $('html, body').stop().animate({
            scrollTop: playerSection.offset().top - navbarHeight
        }, 500);
        
        $('.channel-item').removeClass('active');
        $(this).addClass('active');
    });


    // Search channels (unchanged)
    $('#channelSearch').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        
        if (!searchTerm) {
            $('.channel-item, .channel-group-header').show();
            return;
        }
        
        $('.channel-group-header').hide();
        $('.channel-item').each(function() {
            const channelName = $(this).find('h6').text().toLowerCase();
            const showItem = channelName.includes(searchTerm);
            $(this).toggle(showItem);
            
            // Show group header if any items in group are visible
            if (showItem) {
                $(this).prevAll('.channel-group-header').first().show();
            }
        });
    });
});