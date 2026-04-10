import NewSeriesByProjectPage from "../../../[projectId]/series/new/page";

export default function IwamiSeriesNewPage() {
  return <NewSeriesByProjectPage params={Promise.resolve({ projectId: "iwami-station-poc" })} />;
}
