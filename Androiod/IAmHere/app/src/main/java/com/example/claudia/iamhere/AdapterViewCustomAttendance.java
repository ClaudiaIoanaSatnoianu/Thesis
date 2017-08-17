package com.example.claudia.iamhere;

import android.app.Activity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.TextView;

import java.util.ArrayList;

public class AdapterViewCustomAttendance extends BaseAdapter {

    private Activity context;

    private ArrayList<Schedule> pairs;

    public AdapterViewCustomAttendance(Activity context,
                                       ArrayList<Schedule> pairs) {
        this.context = context;
        this.pairs = pairs;
    }

    @Override
    public int getCount() {
        return pairs.size();
    }

    @Override
    public Object getItem(int position) {
        return null;
    }

    @Override
    public long getItemId(int position) {
        return 0;
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        ViewHolder viewHolder = null;

        if (convertView == null) {
            convertView = LayoutInflater.from(context).inflate(
                    R.layout.custom_row_present_schedule, null);
            viewHolder = new ViewHolder();
            viewHolder.txt = (TextView) convertView
                    .findViewById(R.id.tv_view);
            convertView.setTag(viewHolder);
        } else {
            viewHolder = (ViewHolder) convertView.getTag();
        }

        viewHolder.txt.setText(context.getString(R.string.arrow_symbol) + " " +
                pairs.get(position).getType() + " " + pairs.get(position).getSubject().toUpperCase());
        return convertView;
    }

    public class ViewHolder {
        public TextView txt = null;
    }
}