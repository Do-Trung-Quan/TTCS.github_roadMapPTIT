import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./AboutUs.css"; // Sử dụng file CSS của bạn
import { useAuth } from "../../context/AuthContext";

function AboutUs({ currentLang = "vi" }) {
  const { user, logout, getToken } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState(null);

  const initialContent = useMemo(
    () => ({
      pageTitle: "Về chúng tôi",
      section1Title: "Câu chuyện khởi đầu",
      section1Para1:
        "Chúng tôi vốn là những sinh viên năm 3, với những trăn trở và khát khao được cống hiến. Từ những buổi thảo luận say mê trong góc thư viện, từ những đêm thức trắng code cùng nhau, dự án đầu tay mang tên RoadMapPTIT đã ra đời.",
      section1Para2:
        "RoadMapPTIT không chỉ là một dự án học tập, mà còn là tâm huyết và niềm đam mê của chúng tôi. Chúng tôi muốn tạo ra một nền tảng hỗ trợ toàn diện cho sinh viên PTIT - nơi mà các bạn có thể tìm thấy lộ trình học tập rõ ràng, nguồn tài liệu chất lượng và cộng đồng kết nối.",
      section2Title: "Sứ mệnh của chúng tôi",
      section2Para1:
        "Chúng tôi muốn xóa bỏ rào cản thông tin mà bao thế hệ sinh viên PTIT đã từng gặp phải. Chúng tôi muốn mỗi sinh viên đều có cơ hội tiếp cận với những kiến thức quý giá, những lời khuyên hữu ích và những trải nghiệm thực tế từ các anh chị đi trước.",
      section2Para2:
        "Chúng tôi muốn tạo ra một cộng đồng nơi tinh thần học hỏi, chia sẻ và hỗ trợ lẫn nhau được đề cao. Nơi mà không ai phải bỡ ngỡ khi bước vào giảng đường đại học, không ai phải lạc lối giữa ma trận kiến thức chuyên ngành.",
      section3Title: "Giá trị cốt lõi",
      section3Value1: "Chia sẻ: Chúng tôi tin rằng kiến thức chỉ thực sự có giá trị khi được chia sẻ.",
      section3Value2:
        "Cộng đồng: Chúng tôi xây dựng một môi trường học thuật lành mạnh, nơi mỗi thành viên đều là một mắt xích quan trọng.",
      section3Value3:
        "Sáng tạo: Chúng tôi không ngừng đổi mới, tìm kiếm những phương pháp tốt nhất để truyền tải kiến thức.",
      section3Value4:
        "Chất lượng: Mọi nội dung trên RoadMapPTIT đều được chọn lọc kỹ lưỡng và cập nhật thường xuyên.",
      section4Title: "Hành trình phía trước",
      section4Para1:
        "RoadMapPTIT chỉ mới là bước khởi đầu. Chúng tôi mơ về một tương lai nơi mỗi trường đại học đều có một 'roadmap' riêng, nơi mà không một sinh viên nào phải mò mẫm tìm đường. Với sự đồng hành của các bạn, chúng tôi tin rằng giấc mơ đó sẽ sớm trở thành hiện thực.",
      section4Para2:
        "Hãy cùng chúng tôi viết tiếp câu chuyện RoadMapPTIT - câu chuyện của những người trẻ dám mơ ước và dám hành động vì một cộng đồng sinh viên PTIT tốt đẹp hơn.",
      logoutButton: "Đăng xuất",
      logoutSuccess: "Bạn đã đăng xuất thành công!",
      logoutError: "Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại.",
      tokenExpired: "Phiên đăng nhập đã hết hạn. Bạn đã được đăng xuất.",
    }),
    []
  );

  const [content, setContent] = useState(initialContent);

  const decodeHtmlEntities = useCallback((str) => {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = str;
    return textarea.value;
  }, []);

  const translateText = useCallback(async (texts, targetLang) => {
    try {
      const response = await fetch("http://localhost:8000/api/translate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: texts, target_lang: targetLang }),
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      return data.translated || texts;
    } catch (error) {
      console.error("Lỗi dịch:", error);
      return texts;
    }
  }, []);

  useEffect(() => {
    const translateContent = async () => {
      if (currentLang === "vi") {
        setContent(initialContent);
        return;
      }

      const textsToTranslate = Object.values(initialContent);
      const translatedTexts = await translateText(textsToTranslate, currentLang);
      const updatedContent = {};
      Object.keys(initialContent).forEach((key, index) => {
        updatedContent[key] = decodeHtmlEntities(translatedTexts[index] || initialContent[key]);
      });
      setContent(updatedContent);
    };
    translateContent();
  }, [currentLang, initialContent, translateText, decodeHtmlEntities]);

  const checkTokenExpiration = useCallback(() => {
    const token = getToken();
    if (!token) {
      if (user) {
        setIsLoggingOut(true);
        logout()
          .then(() => {
            setLogoutMessage(content.tokenExpired);
          })
          .catch((error) => {
            console.error("Lỗi khi đăng xuất tự động:", error);
            setLogoutMessage(content.logoutError);
          })
          .finally(() => {
            setIsLoggingOut(false);
          });
      }
      return;
    }

    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const exp = decoded.exp;
      const now = Date.now() / 1000;

      if (exp && exp < now) {
        setIsLoggingOut(true);
        logout()
          .then(() => {
            setLogoutMessage(content.tokenExpired);
          })
          .catch((error) => {
            console.error("Lỗi khi đăng xuất tự động:", error);
            setLogoutMessage(content.logoutError);
          })
          .finally(() => {
            setIsLoggingOut(false);
          });
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra token:", error);
      if (user) {
        setIsLoggingOut(true);
        logout()
          .then(() => {
            setLogoutMessage(content.tokenExpired);
          })
          .catch((error) => {
            console.error("Lỗi khi đăng xuất tự động:", error);
            setLogoutMessage(content.logoutError);
          })
          .finally(() => {
            setIsLoggingOut(false);
          });
      }
    }
  }, [getToken, user, logout, content.tokenExpired, content.logoutError]);

  useEffect(() => {
    if (!user) return;

    checkTokenExpiration();

    const intervalId = setInterval(() => {
      checkTokenExpiration();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [user, checkTokenExpiration]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutMessage(null);
    try {
      await logout();
      setLogoutMessage(content.logoutSuccess);
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      setLogoutMessage(content.logoutError);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="about-us-container">
      {logoutMessage && (
        <div className="logout-message">
          {logoutMessage}
        </div>
      )}

      <h1 className="about-us-title">{content.pageTitle}</h1>

      {user && (
        <div className="logout-section">
          <button onClick={handleLogout} disabled={isLoggingOut} className="logout-button">
            {isLoggingOut ? "Đang đăng xuất..." : content.logoutButton}
          </button>
        </div>
      )}

      <section className="about-us-section">
        <h2 className="section-title">{content.section1Title}</h2>
        <p>{content.section1Para1}</p>
        <p>{content.section1Para2}</p>
      </section>

      <section className="about-us-section">
        <h2 className="section-title">{content.section2Title}</h2>
        <p>{content.section2Para1}</p>
        <p>{content.section2Para2}</p>
      </section>

      <section className="about-us-section">
        <h2 className="section-title">{content.section3Title}</h2>
        <ul className="core-values-list">
          <li dangerouslySetInnerHTML={{ __html: content.section3Value1 }} />
          <li dangerouslySetInnerHTML={{ __html: content.section3Value2 }} />
          <li dangerouslySetInnerHTML={{ __html: content.section3Value3 }} />
          <li dangerouslySetInnerHTML={{ __html: content.section3Value4 }} />
        </ul>
      </section>

      <section className="about-us-section">
        <h2 className="section-title">{content.section4Title}</h2>
        <p>{content.section4Para1}</p>
        <p>{content.section4Para2}</p>
      </section>
    </div>
  );
}

export default AboutUs;