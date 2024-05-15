'use client';
import { Status, Wrapper } from "@googlemaps/react-wrapper";
import { useEffect, useState } from "react";
import CustomMarker from "../CustomMarker";
import Map from "../Map";
import { SafeListing, SafeUser } from "@/app/types";
import MapComponent from "../Map/Map";
import { LatLngLiteral } from "leaflet";
import { IListingParams } from '../../actions/getListings';


const render = (status: Status) => (<h1>{status}</h1>)

interface GoogleMapProps {
  zoom: number;
  apiKey: string;
  center: LatLngLiteral;
  listings: SafeListing[];
  currentUser?: any;
}

export default function GoogleMap({
  apiKey,
  zoom,
  center,
  listings
}: GoogleMapProps) {
  
  return (
    <div className="flex mt-4 pt-24 overflow-clip"> 
      <Wrapper apiKey={apiKey} render={render}>
        <MapComponent
          zoom={zoom}
          center={center}
        >
              {listings.map((listing) => {
                return (
                  <CustomMarker
                    key={listing.id}
                    data={listing}
                  />
                )
              })}
        </MapComponent>
      </Wrapper>
    </div>
  );
}