
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
        import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp, query, orderBy, doc, getDoc, setDoc, updateDoc, increment } 
            from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

        // ==========================================
        // BƯỚC 1: DÁN MÃ FIREBASE CONFIG CỦA BẠN VÀO ĐÂY
        // ==========================================
        const firebaseConfig = {
            apiKey: "AIzaSyA8ebQlWqky7pIrXLbtQNhK95k43_SLKTo",
            authDomain: "thiepmoitotnghiep.firebaseapp.com",
            projectId: "thiepmoitotnghiep",
            storageBucket: "thiepmoitotnghiep.firebasestorage.app",
            messagingSenderId: "322210029716",
            appId: "1:322210029716:web:b2e6d5d9b739f8931d9481",
            measurementId: "G-WNM2HKWP7J"
        };

        // Khởi tạo Firebase
        let app, db;
        try {
            app = initializeApp(firebaseConfig);
            db = getFirestore(app);
            console.log("Firebase initialized successfully");
        } catch (e) {
            console.error("Firebase setup failed. Please check your firebaseConfig.", e);
        }

        const commentsGrid = document.getElementById('commentsGrid');
        
        // 1. Lắng nghe dữ liệu (Realtime)
        if (db) {
            const q = query(collection(db, "comments"), orderBy("timestamp", "desc"));
            onSnapshot(q, (snapshot) => {
                commentsGrid.innerHTML = ''; // Xóa chữ "Đang tải"
                
                if (snapshot.empty) {
                    commentsGrid.innerHTML = '<p style="text-align: center; color: var(--text-main); font-style: italic; width: 100%; grid-column: 1 / -1;">Chưa có lời chúc nào. Hãy là người đầu tiên gửi lời chúc nhé!</p>';
                    return;
                }

                snapshot.forEach((doc) => {
                    const data = doc.data();
                    const name = data.name || "Khách ẩn danh";
                    const message = data.message || "";
                    if (!message) return; // Không hiện nếu khách không gửi lời chúc

                    const avatarLetter = name.charAt(0).toUpperCase();
                    
                    const cardHTML = `
                    <div class="comment-card glass-card reveal active">
                        <i class="fa-solid fa-quote-right comment-quote"></i>
                        <p class="comment-text">"${message}"</p>
                        <div class="comment-author">
                            <div class="author-avatar">${avatarLetter}</div>
                            <span>${name}</span>
                        </div>
                    </div>
                    `;
                    commentsGrid.insertAdjacentHTML('beforeend', cardHTML);
                });
            });
        } else {
            commentsGrid.innerHTML = '<p style="text-align: center; color: red; font-style: italic; width: 100%; grid-column: 1 / -1;">Vui lòng dán cấu hình firebaseConfig để tải lời chúc.</p>';
        }

        // 2. Gửi lời chúc khi bấm xác nhận
        const confirmBtn = document.getElementById('confirmBtn');
        const guestNameInput = document.getElementById('guestName');
        const guestMessageInput = document.getElementById('guestMessage');

        confirmBtn.addEventListener('click', async () => {
            const name = guestNameInput.value.trim();
            const message = guestMessageInput.value.trim();

            if (!name) {
                alert("Vui lòng nhập tên của bạn nhé!");
                return;
            }

            // Lưu lên Firestore
            if (db && firebaseConfig.apiKey !== "YOUR_API_KEY") {
                try {
                    const confirmBtnText = confirmBtn.innerHTML;
                    confirmBtn.innerHTML = "Đang gửi...";
                    
                    await addDoc(collection(db, "comments"), {
                        name: name,
                        message: message,
                        timestamp: serverTimestamp()
                    });
                    
                    confirmBtn.innerHTML = confirmBtnText;
                } catch (e) {
                    console.error("Lỗi gửi lời chúc: ", e);
                    alert("Có lỗi xảy ra khi gửi lời chúc. Vui lòng kiểm tra lại cấu hình Firebase.");
                }
            }
            
            // Xóa form sau 1 giây
            setTimeout(() => {
                guestNameInput.value = '';
                guestMessageInput.value = '';
            }, 1000);
        });

        // ==========================================
        // 3. THƯ VIỆN ẢNH (GALLERY) - XEM & BÌNH LUẬN
        // ==========================================
        // Danh sách ảnh tĩnh (bạn có thể thay thế bằng link ảnh của mình)
        const galleryImages = [
            "img/1782531978566_1801300736101727551_2528557718954405591_1bbb2064d17adea3e2dceb13d1bd21bb.jpg",
            "img/1782531979147_1801300736101727551_2528557718954405591_b7ea2589e57d73037507a2174797c5a9.jpg",
            "img/1782531979738_1801300736101727551_2528557718954405591_874def1672ef986f0357f43f1b3dd552.jpg",
            "img/1782531980317_1801300736101727551_2528557718954405591_b5a7886845667037336134032cd2efbc.jpg",
            "img/1782531980802_1801300736101727551_2528557718954405591_0b025ea5cf67037a826d17041c3a7df8.jpg",
            "img/1782531981310_1801300736101727551_2528557718954405591_6dfdfa5370904e36d31fd8adb069d327.jpg",
            "img/1782531981642_1801300736101727551_2528557718954405591_d5b3530b6cd933cd8d1e44ccd4d78edc.jpg",
            "img/1782531982290_1801300736101727551_2528557718954405591_35f9938474ea761c8787bf45d33f75d8.jpg",
            "img/1782531982808_1801300736101727551_2528557718954405591_6b3341931ac4c5e1e172fa6846b3ed11.jpg",
            "img/1782531983500_1801300736101727551_2528557718954405591_f8db623ab19935bd65b651e6b4b5e250.jpg",
            "img/1782531983984_1801300736101727551_2528557718954405591_02c7fdc8b11b143deb6e14d01a4b37b9.jpg",
            "img/1782531984237_1801300736101727551_2528557718954405591_a72f14af0b1016605a96c33935654beb.jpg",
            "img/1782531984795_1801300736101727551_2528557718954405591_0ffe4bec8c3fad528e1831c2f5fbfa44.jpg",
            "img/1782531985030_1801300736101727551_2528557718954405591_b76073b4944f9910b4a99b30e99512f1.jpg",
            "img/1782531985634_1801300736101727551_2528557718954405591_2ef7d19d1fe7cf27cf37e6013b898e95.jpg",
            "img/1782531986211_1801300736101727551_2528557718954405591_d03567a1d6cd42487edc56fca2f9f7c0.jpg",
            "img/1782531986935_1801300736101727551_2528557718954405591_9c8dddf069f984c780e01e1f18cfcb05.jpg",
            "img/1782531987109_1801300736101727551_2528557718954405591_e7b437c15c120a56b979ba7ef333bd4d.jpg",
            "img/1782531987655_1801300736101727551_2528557718954405591_a708f79affea12b3a9333dc02def84ee.jpg",
            "img/1782531988198_1801300736101727551_2528557718954405591_e690a79c2861d493f8245fd0a0e918bc.jpg",
            "img/1782531988428_1801300736101727551_2528557718954405591_12a1c3926135b6c73703b3c25f3137d9.jpg",
            "img/1782531988933_1801300736101727551_2528557718954405591_5d37985056274e92a83925ab6f12f677.jpg",
            "img/1782531989485_1801300736101727551_2528557718954405591_ad8010d8a95e54365bf587bd4b78abd1.jpg",
            "img/1782531989735_1801300736101727551_2528557718954405591_d4c7ba42f79b7068c44e791e8c19f348.jpg",
            "img/1782531990153_1801300736101727551_2528557718954405591_32eae67d357a44c6dc737bd1aa8201d2.jpg",
            "img/1782531990645_1801300736101727551_2528557718954405591_62155ec5577fc079b5783080638ef104.jpg",
            "img/1782531991194_1801300736101727551_2528557718954405591_cf07ae0f974f40c0f5dfa0d0448a1cb5.jpg",
            "img/1782531991691_1801300736101727551_2528557718954405591_df9b95476b4c021851659c903fda1339.jpg",
            "img/1782531992214_1801300736101727551_2528557718954405591_84e9af2ab462e4b4fce84295118b8f67.jpg",
            "img/1782531992722_1801300736101727551_2528557718954405591_5dde9b08a817b0c0a5ed2da64f4beb90.jpg",
            "img/1782531993355_1801300736101727551_2528557718954405591_8b028777fff81b3008e35e8456ca73b9.jpg",
            "img/1782531994027_1801300736101727551_2528557718954405591_b1da16bccc4adc09e5c3829ba6666ed8.jpg",
            "img/1782531994276_1801300736101727551_2528557718954405591_276b2a48017ba8c3bd2b9d86a18ac5a0.jpg",
            "img/1782531994484_1801300736101727551_2528557718954405591_18a9502bfe88593bbaef1e6a1798ddb6.jpg",
            "img/1782531994711_1801300736101727551_2528557718954405591_cfd5a2830c490bae1e02bddffff7bad0.jpg",
            "img/1782531994903_1801300736101727551_2528557718954405591_c2369d1e35381e1d48532dfe8e657bbc.jpg",
            "img/1782531995378_1801300736101727551_2528557718954405591_136073fa4a9ef16380536c247cfd4fa2.jpg",
            "img/1782531995858_1801300736101727551_2528557718954405591_bf2be0a42359f0467c2dedcc3080dcca.jpg",
            "img/1782531996411_1801300736101727551_2528557718954405591_e261f067857b0d141429503bf1c627ff.jpg",
            "img/1782532050375_1801300736101727551_2528557718954405591_08315ce1f27b51a766c80feaa9f4eae5.jpg",
            "img/1HVC4ROQG_7729P6.JPG",
            "img/3tuoi.jpg",
            "img/4DBF8D4B-4721-47DC-BFA0-9540DE22B839.JPG",
            "img/IMG_0519.JPG",
            "img/IMG_1026.JPG",
            "img/IMG_1080.jpg",
            "img/IMG_1720.jpg",
            "img/IMG_1783.JPG",
            "img/IMG_2003.jpg",
            "img/IMG_2172.JPG",
            "img/IMG_2179.JPG",
            "img/IMG_2219.jpg",
            "img/IMG_2453.JPG",
            "img/IMG_2573.jpg",
            "img/IMG_2574.jpg",
            "img/IMG_2575.JPG",
            "img/IMG_3126.jpg",
            "img/IMG_3349.JPG",
            "img/IMG_4050.jpeg",
            "img/IMG_4430.jpeg",
            "img/IMG_4434.jpeg",
            "img/IMG_4620.jpeg",
            "img/IMG_4920.jpeg",
            "img/IMG_4921.JPG",
            "img/IMG_5057.PNG",
            "img/IMG_5495.jpeg",
            "img/IMG_6406.jpeg",
            "img/IMG_6446.JPG",
            "img/IMG_6447.JPG",
            "img/IMG_7073.jpeg",
            "img/IMG_7435.jpg",
            "img/IMG_7532.JPG",
            "img/IMG_7670.JPG",
            "img/IMG_8026.jpeg",
            "img/IMG_8522.jpeg",
            "img/IMG_9234.JPG",
            "img/IMG_9744.JPG",
            "img/NGO_8649.jpg"
        ];

        const openGalleryBtn = document.getElementById('openGalleryBtn');
        const galleryModal = document.getElementById('galleryModal');
        const closeGalleryBtn = document.getElementById('closeGalleryBtn');
        const galleryGrid = document.getElementById('galleryGrid');
        
        const photoModal = document.getElementById('photoModal');
        const closePhotoBtnDesktop = document.getElementById('closePhotoBtnDesktop');
        const closePhotoBtnMobile = document.getElementById('closePhotoBtnMobile');
        const photoViewerImg = document.getElementById('photoViewerImg');
        const photoViewerVideo = document.getElementById('photoViewerVideo');
        const likeBtn = document.getElementById('likeBtn');
        const likeCountSpan = document.getElementById('likeCount');
        const photoCommentsList = document.getElementById('photoCommentsList');
        const sendPhotoCommentBtn = document.getElementById('sendPhotoCommentBtn');
        const photoCommentName = document.getElementById('photoCommentName');
        const photoCommentText = document.getElementById('photoCommentText');

        let currentPhotoId = null;
        let currentPhotoUnsubscribe = null;

        // Render Gallery Images
        function renderGallery() {
            galleryGrid.innerHTML = '';
            galleryImages.forEach((url, index) => {
                const photoId = `photo_${index + 1}`;
                
                const isVideo = url.toLowerCase().endsWith('.mp4');
                const mediaHTML = isVideo 
                    ? `<video src="${url}#t=0.1" preload="metadata" muted playsinline style="width: 100%; height: auto; display: block; border-radius: 8px;"></video>
                       <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 3rem; opacity: 0.8; pointer-events: none;"><i class="fa-regular fa-circle-play"></i></div>`
                    : `<img src="${url}" loading="lazy" alt="Gallery image">`;

                const item = document.createElement('div');
                item.className = 'gallery-item';
                item.innerHTML = `
                    ${mediaHTML}
                    <div class="gallery-item-overlay">
                        <div class="overlay-stat"><i class="fa-solid fa-heart"></i> <span id="stat_likes_${photoId}">0</span></div>
                        <div class="overlay-stat"><i class="fa-solid fa-comment"></i> <span id="stat_comments_${photoId}">0</span></div>
                    </div>
                `;
                item.addEventListener('click', () => openPhotoViewer(url, photoId));
                galleryGrid.appendChild(item);

                // Fetch real-time stats
                if (db) {
                    onSnapshot(doc(db, "photos", photoId), (docSnap) => {
                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            const statLikes = document.getElementById(`stat_likes_${photoId}`);
                            if(statLikes) statLikes.innerText = data.likes || 0;
                        }
                    });
                    
                    const qComments = query(collection(db, "photos", photoId, "comments"));
                    onSnapshot(qComments, (snap) => {
                        const statComments = document.getElementById(`stat_comments_${photoId}`);
                        if(statComments) statComments.innerText = snap.size;
                    });
                }
            });
        }

        // Open/Close Gallery Modal
        openGalleryBtn.addEventListener('click', () => {
            renderGallery();
            galleryModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        closeGalleryBtn.addEventListener('click', () => {
            galleryModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });

        // Open Photo Viewer Modal
        function openPhotoViewer(url, photoId) {
            currentPhotoId = photoId;
            
            const isVideo = url.toLowerCase().endsWith('.mp4');
            if (isVideo) {
                photoViewerImg.style.display = 'none';
                photoViewerVideo.src = url;
                photoViewerVideo.style.display = 'block';
                photoViewerVideo.play().catch(e => console.log("Autoplay prevented"));
            } else {
                photoViewerVideo.style.display = 'none';
                photoViewerVideo.pause();
                photoViewerImg.src = url;
                photoViewerImg.style.display = 'block';
            }
            
            photoModal.classList.add('active');
            
            // Local like status
            const likedPhotos = JSON.parse(localStorage.getItem('likedPhotos') || '{}');
            if (likedPhotos[photoId]) {
                likeBtn.classList.add('liked');
            } else {
                likeBtn.classList.remove('liked');
            }
            
            likeCountSpan.innerText = '0';
            photoCommentsList.innerHTML = '<p style="text-align: center; color: #999; font-style: italic; margin-top: 20px;">Đang tải...</p>';

            if (currentPhotoUnsubscribe) currentPhotoUnsubscribe();

            if (db) {
                // Listen to likes
                const photoRef = doc(db, "photos", photoId);
                onSnapshot(photoRef, (docSnap) => {
                    if (docSnap.exists()) {
                        likeCountSpan.innerText = docSnap.data().likes || 0;
                    } else {
                        setDoc(photoRef, { likes: 0 }, { merge: true });
                    }
                });

                // Listen to comments
                const q = query(collection(db, "photos", photoId, "comments"), orderBy("timestamp", "asc"));
                currentPhotoUnsubscribe = onSnapshot(q, (snapshot) => {
                    photoCommentsList.innerHTML = '';
                    if (snapshot.empty) {
                        photoCommentsList.innerHTML = '<p style="text-align: center; color: #999; font-style: italic; margin-top: 20px;">Chưa có bình luận nào. Hãy là người đầu tiên!</p>';
                        return;
                    }

                    snapshot.forEach((cDoc) => {
                        const data = cDoc.data();
                        const html = `
                            <div class="comment-item">
                                <strong>${data.name}</strong>
                                ${data.text}
                            </div>
                        `;
                        photoCommentsList.insertAdjacentHTML('beforeend', html);
                    });
                    setTimeout(() => {
                        photoCommentsList.scrollTop = photoCommentsList.scrollHeight;
                    }, 50);
                });
            }
        }

        // Close Photo Viewer
        const closePhoto = () => {
            photoModal.classList.remove('active');
            if (photoViewerVideo) photoViewerVideo.pause();
            if (currentPhotoUnsubscribe) {
                currentPhotoUnsubscribe();
                currentPhotoUnsubscribe = null;
            }
        };
        closePhotoBtnDesktop.addEventListener('click', closePhoto);
        closePhotoBtnMobile.addEventListener('click', closePhoto);

        // Nút Thả Tim
        likeBtn.addEventListener('click', async () => {
            if (!currentPhotoId || !db) return;
            
            const likedPhotos = JSON.parse(localStorage.getItem('likedPhotos') || '{}');
            const photoRef = doc(db, "photos", currentPhotoId);

            if (!likedPhotos[currentPhotoId]) {
                likedPhotos[currentPhotoId] = true;
                localStorage.setItem('likedPhotos', JSON.stringify(likedPhotos));
                likeBtn.classList.add('liked');
                
                await updateDoc(photoRef, {
                    likes: increment(1)
                }).catch(async (e) => {
                    if (e.code === 'not-found') {
                        await setDoc(photoRef, { likes: 1 });
                    }
                });
            } else {
                delete likedPhotos[currentPhotoId];
                localStorage.setItem('likedPhotos', JSON.stringify(likedPhotos));
                likeBtn.classList.remove('liked');
                
                await updateDoc(photoRef, {
                    likes: increment(-1)
                });
            }
        });

        // Nút Gửi Bình Luận
        sendPhotoCommentBtn.addEventListener('click', async () => {
            if (!currentPhotoId || !db) return;

            const name = photoCommentName.value.trim();
            const text = photoCommentText.value.trim();

            if (!name || !text) {
                alert("Vui lòng nhập cả tên và bình luận!");
                return;
            }

            sendPhotoCommentBtn.disabled = true;
            sendPhotoCommentBtn.innerText = "Đang gửi...";

            try {
                await addDoc(collection(db, "photos", currentPhotoId, "comments"), {
                    name: name,
                    text: text,
                    timestamp: serverTimestamp()
                });
                photoCommentText.value = '';
            } catch (e) {
                console.error("Lỗi gửi bình luận: ", e);
                alert("Có lỗi xảy ra, vui lòng thử lại.");
            }

            sendPhotoCommentBtn.disabled = false;
            sendPhotoCommentBtn.innerText = "Gửi bình luận";
        });
    