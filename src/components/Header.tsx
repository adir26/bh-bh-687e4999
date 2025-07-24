
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  userName: string;
}

export const Header: React.FC<HeaderProps> = ({ userName }) => {
  const navigate = useNavigate();

  const handleNotificationsClick = () => {
    navigate('/notifications');
  };

  return (
    <header className="flex justify-between items-center self-stretch bg-neutral-50 pt-3 pb-2 px-3 xs:pt-4 xs:pb-2 xs:px-4 sm:px-5">
      <div className="flex w-10 h-10 xs:w-12 xs:h-12 items-center">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/25232c54ada7ccb23c097ee9c1cf936b2eb0aece?width=64"
          alt="User avatar"
          className="w-7 h-7 xs:w-8 xs:h-8 shrink-0 rounded-2xl"
        />
      </div>
      <div className="flex flex-col items-center flex-[1_0_0] px-2">
        <h1 className="self-stretch text-[#121417] text-center text-base xs:text-lg font-bold leading-5 xs:leading-[23px] text-wrap-balance">
          היי, {userName}
        </h1>
      </div>
      <div className="flex w-10 h-10 xs:w-12 xs:h-12 justify-end items-center">
        <button 
          className="flex h-10 w-10 xs:h-12 xs:w-12 justify-center items-center rounded-xl hover:bg-gray-100 active:scale-95 transition-all focus-ring"
          aria-label="Notifications"
          onClick={handleNotificationsClick}
        >
          <div className="flex flex-col items-center">
            <div
              dangerouslySetInnerHTML={{
                __html:
                  "<svg width=\"18\" height=\"20\" viewBox=\"0 0 18 20\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" class=\"notification-icon\" style=\"width: 20px; height: 20px; fill: #121417\"> <path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M17.7938 14.4944C17.2734 13.5981 16.5 11.0622 16.5 7.75C16.5 3.60786 13.1421 0.25 9 0.25C4.85786 0.25 1.5 3.60786 1.5 7.75C1.5 11.0631 0.725625 13.5981 0.205312 14.4944C-0.065134 14.9581 -0.067101 15.5311 0.200155 15.9967C0.467411 16.4623 0.963134 16.7496 1.5 16.75H5.32594C5.68267 18.4956 7.21835 19.7492 9 19.7492C10.7816 19.7492 12.3173 18.4956 12.6741 16.75H16.5C17.0367 16.7493 17.5321 16.4619 17.7991 15.9963C18.0662 15.5308 18.0641 14.958 17.7938 14.4944ZM9 18.25C8.04674 18.2497 7.19713 17.6487 6.87938 16.75H11.1206C10.8029 17.6487 9.95326 18.2497 9 18.25ZM1.5 15.25C2.22188 14.0088 3 11.1325 3 7.75C3 4.43629 5.68629 1.75 9 1.75C12.3137 1.75 15 4.43629 15 7.75C15 11.1297 15.7763 14.0059 16.5 15.25H1.5Z\" fill=\"#121417\"></path> </svg>",
              }}
            />
          </div>
        </button>
      </div>
    </header>
  );
};
