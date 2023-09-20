function projectModule({
  title,
  image,
  techStach,
  client,
  gitHub,
  previewLink,
  description,
  setShowDetails,
  page,
}) {
  return (
    <div
      onClick={() => {
        setShowDetails(prev => ({
          ...prev,
          show: true,
          projectDetails: {
            title: title,
            img: image,
            client: client,
            description: description,
            gitHub: gitHub,
            preview: previewLink,
            techStach: techStach,
          },
        }));
      }}
      className={`hover:shadow-2xl shadow-sm transition-all cursor-pointer flex flex-col gap-1 p-0 border ${
        page == 'work' ? 'border-gray-500' : 'border-gray-200'
      }  rounded-sm`}
    >
      <h3 className="text-gray-400 p-1 ">{title}</h3>
      <img className=" p-1" src={image} alt="" />
      <div className=" flex-wrap p-1 flex  text-[6px] gap-y-1 gap-x-1">
        {page === 'monitor' &&
          techStach?.map((d, i) => {
            return (
              <span
                className="border border-grey-600 rounded-sm text-gray-700 pr-[2px] pl-[2px]"
                key={i}
              >
                {d}
              </span>
            );
          })}
      </div>
    </div>
  );
}

export default projectModule;
