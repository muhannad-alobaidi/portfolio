import { backImage } from '../../assets';
function projectDetailsPage({ details, setShowDetails, page }) {
  return (
    <div
      className={`flex absolute w-[100%] h-[100%] top-0 z-20 bg-slate-400 ${
        page === 'work' ? 'p-12 gap-12' : 'p-2 gap-4'
      }   `}
    >
      <div className="flex-[50%]  ">
        <img
          src={details.projectDetails?.img}
          alt=""
          className=" rounded-md shadow-xl hover:shadow-2xl transition-all"
        />
        <p className="mt-4 mb-3"> Client: {details.projectDetails?.client}</p>
        <div className=" flex flex-wrap gap-2 mt-2">
          {details.projectDetails?.techStach?.map((d, i) => {
            return (
              <span
                className=" px-2 pr-2 border shadow-sm hover:shadow-lg transition-all  rounded-sm text-gray-700 "
                key={i}
              >
                {d}
              </span>
            );
          })}
        </div>
      </div>
      <div className="flex-[50%]">
        <h2 className="text-lg text-gray-700 ">
          {details.projectDetails?.title}
        </h2>
        <p
          className={` text-gray-700 ${
            page === 'work' ? 'text-[16px] mt-8 mb-8 ' : 'text-[9px] mt-4 mb-4 '
          }`}
        >
          {details.projectDetails?.description}
        </p>
        <div className="flex gap-2">
          {details.projectDetails?.gitHub && (
            <a
              target="blank"
              className="border rounded-sm text-gray-600 p-1"
              href={details.projectDetails?.gitHub}
            >
              Github
            </a>
          )}
          <a
            target="blank"
            className="border shadow-sm hover:shadow-xl transition-all rounded-sm text-gray-600 p-1 pl-2 pr-2"
            href={details.projectDetails?.preview}
          >
            preview
          </a>
        </div>
        <div
          onClick={() => {
            setShowDetails(prev => ({
              ...prev,
              show: false,
            }));
          }}
          className=" hover:translate-x-[-5px] transition-all hover:scale-110 cursor-pointer absolute bottom-3 right-3 w-10 h-10"
        >
          <img className=" w-[100%]" src={backImage} alt="" />
        </div>
      </div>
    </div>
  );
}

export default projectDetailsPage;
