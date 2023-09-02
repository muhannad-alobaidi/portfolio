import { backImage } from '../../assets';
function projectDetailsPage({ details, setShowDetails }) {
  return (
    <div className=" flex gap-4 absolute w-[100%] h-[100%] top-0 z-20 bg-white p-2">
      <div className="flex-[50%]  ">
        <img src={details.projectDetails?.img} alt="" />
        <p className="mt-2"> Client: {details.projectDetails?.client}</p>
        <div className=" flex flex-wrap gap-2 mt-2">
          {details.projectDetails?.techStach?.map((d, i) => {
            return (
              <span
                className="border border-grey-600  rounded-sm text-gray-700 pr-[2px] pl-[2px]"
                key={i}
              >
                {d}
              </span>
            );
          })}
        </div>
      </div>
      <div className="flex-[50%]">
        <h2 className="text-lg ">{details.projectDetails?.title}</h2>
        <p className="mt-2 mb-2">{details.projectDetails?.description}</p>
        <div className="flex gap-2">
          <a
            target="blank"
            className="border border-gray-400 rounded-sm text-gray-600 p-1"
            href={details.projectDetails?.gitHub}
          >
            Github
          </a>
          <a
            target="blank"
            className="border border-gray-400 rounded-sm text-gray-600 p-1"
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
          className=" absolute bottom-3 right-3 w-10 h-10"
        >
          <img className=" w-[100%]" src={backImage} alt="" />
        </div>
      </div>
    </div>
  );
}

export default projectDetailsPage;
